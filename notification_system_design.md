# Notification System Design

## Stage 1: API Design for Placements, Events, Results

### Core API
The application uses a single REST endpoint to serve all notification categories:

`GET /evaluation-service/notifications`

Supported query parameters:
- `limit` — maximum number of notifications to return
- `page` — page number (1-indexed)
- `notification_type` — filter by `Placement`, `Result`, or `Event`

### Request example
`GET /evaluation-service/notifications?limit=10&page=1&notification_type=Placement`

### Response structure
```json
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-390ea14576bc",
      "Type": "Placement",
      "Message": "Advanced Micro Devices Inc. hiring",
      "Timestamp": "2026-04-22 17:49:42"
    }
  ]
}
```

### JSON Schema
```json
{
  "type": "object",
  "properties": {
    "notifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ID": { "type": "string" },
          "Type": { "type": "string", "enum": ["Placement", "Result", "Event"] },
          "Message": { "type": "string" },
          "Timestamp": { "type": "string", "format": "date-time" }
        },
        "required": ["ID", "Type", "Message", "Timestamp"]
      }
    }
  },
  "required": ["notifications"]
}
```

### Type-based semantics
- `Placement` — highest priority campus hiring notifications
- `Result` — medium priority score, exam and result notifications
- `Event` — lower priority campus event notifications

## Stage 2: Persistence and Technology Choice

### Recommended database
SQL database (PostgreSQL) is the preferred choice for this evaluation.

### Why SQL?
- well-suited for structured notification records
- strong indexing and query optimization
- transactional writes for reliable delivery state
- easier joins for student and metadata lookups

### Schema example
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  notification_type VARCHAR(16) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);
```

### Scalability and reliability
- Use connection pooling with PgBouncer or native pool
- Use a cache layer (Redis) for frequently read notification results
- Keep API stateless so multiple backend instances can scale behind a load balancer
- Persist notification metadata before emitting delivery tasks

## Stage 3: Slow query analysis

### Problem query
```sql
SELECT * FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### Why it is slow
- no index on `studentID`, `isRead`, or `createdAt` causes full table scans
- the query must examine 5,000,000 notification rows
- sorting by `createdAt` increases cost significantly

### Optimization
- add a composite index:
  `CREATE INDEX idx_notifications_student_read_created ON notifications(student_id, is_read, created_at);`
- if filtering by notification type is common, extend it:
  `CREATE INDEX idx_notifications_student_read_type_created ON notifications(student_id, is_read, notification_type, created_at);`

### Computation cost
- with the composite index, the query cost becomes O(log N + k)
- without the index, the DB may scan O(N) rows and then sort

### Notification type filtering
- use the same indexed columns for type filtering when type is active
- avoid scanning irrelevant notification types in the hot path

## Stage 4: Page refresh overload

### Challenges
- fetching notifications on every page load creates heavy DB load
- repeated identical queries reduce system throughput

### Improvements
- use caching for notification feeds (Redis per student)
- fetch only incremental updates instead of reloading the full page
- leverage browser caching and ETag/Last-Modified headers

### Tradeoffs
- caching introduces complexity around invalidation
- eventual consistency may be acceptable for short-lived feeds
- read-heavy scaling is best solved with cache + DB fallbacks

## Stage 5: Notify All redesign

### Issues with naive pseudocode
- sequential processing of 50,000 students is too slow
- partial failures cause inconsistencies between email and DB state
- no retry or batching mechanism is present

### Reliability concerns
- if `send_email` fails after some DB writes, the system has inconsistent state
- if `save_to_db` fails, users may miss in-app notifications despite email delivery
- synchronous operations block the whole batch

### Recommended architecture
- persist notifications first into the database
- enqueue delivery tasks for email and push notifications
- process delivery asynchronously with worker queues
- implement retries with exponential backoff and dead-letter handling

### Should DB save and email happen together?
- do not require synchronous email delivery on the same transaction
- write the notification record first, then trigger delivery tasks
- the DB should own the source of truth while email is eventually consistent

## Stage 6: Priority Inbox

### Priority rules
- `Placement` > `Result` > `Event`

### Implemented features
- backend sorts notifications by type priority and timestamp
- supports `limit`, `page`, and `notification_type`
- returns top notifications in the `notifications` array

## Stage 7: Frontend UX

### Requirements met
- Application runs on `http://localhost:3000`
- Uses React + TypeScript + Material UI only
- Implements responsive desktop and mobile-friendly UI
- Displays:
  - Priority Inbox view
  - All Notifications view
- Supports filtering by notification type and pagination

### Logging middleware
- Shared `Log(stack, level, package, message)` contract is implemented
- Backend logs are emitted from middleware and route handlers
- Frontend logs analytics and API errors through the same contract

## Logging API contract

`POST http://4.224.186.213/evaluation-service/logs`

Request body:
```json
{
  "stack": "backend",
  "level": "error",
  "package": "handler",
  "message": "received string, expected bool"
}
```

## Authentication & protection
- backend route is protected with bearer token auth
- set `API_TOKEN` in environment variables to secure access
