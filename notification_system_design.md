# Notification System Design

## Overview
The application is a full-stack notification delivery proof-of-concept composed of:
- `logging_middleware/` for reusable logging behavior and remote log submission
- `notification_app_be/` for the backend notification API
- `notification_app_fe/` for the React frontend client

## Architecture

### Backend
- Express-based HTTP server exposing `GET /evaluation-service/notifications`
- Request logging middleware records every incoming request and response details
- Backend log events are emitted using a shared `Log(stack, level, package, message)` utility
- Notifications are returned as JSON with support for `limit`, `page`, and `notification_type`

### Frontend
- React + TypeScript application built with Vite
- Material UI is used for layout and controls
- The app fetches the backend notification API and renders:
  - a priority inbox top 10 view
  - all notifications view
  - type filtering and pagination controls
- Frontend events are logged with the same `Log` contract using `frontend` stack semantics

## Logging Design

### Reusable `Log` function
The logging implementation supports:
- `stack` values: `backend`, `frontend`
- `level` values: `debug`, `info`, `warn`, `error`, `fatal`
- package names scoped by backend, frontend, and shared concerns

Backend packages:
- `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

Frontend packages:
- `api`, `component`, `hook`, `page`, `state`, `style`

Shared packages:
- `auth`, `config`, `middleware`, `utils`

### Log transport
- Backend logs are output to the console and can optionally be posted to the centralized logging API if `LOGGING_API_TOKEN` is configured
- Frontend logs are written to the browser console and can optionally post to the same remote endpoint via `VITE_LOGGING_API_TOKEN`

### Middleware behavior
- `logging_middleware` captures each request start and response completion
- It emits `debug` logs for incoming request metadata
- It emits `info` logs for response status and latency

## API Contract

### Notification API
`GET /evaluation-service/notifications`
- Query parameters:
  - `limit` (number)
  - `page` (number)
  - `notification_type` (`Event`, `Result`, `Placement`)

Response:
```json
{
  "notifications": [
    {
      "ID": "...",
      "Type": "Placement",
      "Message": "...",
      "Timestamp": "2026-04-22 17:50:00"
    }
  ]
}
```

## Running the system
- `notification_app_be`: `npm run start`
- `notification_app_fe`: `npm run dev`

## Improvements and next steps
- Add a real notification persistence layer and authenticated routes
- Add registration and auth flow using the evaluation service APIs
- Add screenshot capture and visual test coverage for desktop/mobile views
