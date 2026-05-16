import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { loggingMiddleware, Log } from 'logging_middleware';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const apiToken = process.env.API_TOKEN || 'test-token';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization') || '';
  const expected = `Bearer ${apiToken}`;

  if (authHeader !== expected) {
    Log('backend', 'warn', 'route', `unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);
app.use(requireAuth);

app.get('/evaluation-service/notifications', (req, res) => {
  try {
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const page = Math.max(1, Number(req.query.page) || 1);
    const type = String(req.query.notification_type || '').trim();

    const priorityWeight: Record<string, number> = {
      Placement: 3,
      Result: 2,
      Event: 1,
    };

    const allNotifications = [
      { ID: '1', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:42' },
      { ID: '2', Type: 'Result', Message: 'mid-sem results are ready', Timestamp: '2026-04-22 17:50:54' },
      { ID: '3', Type: 'Event', Message: 'TechFest happening tomorrow', Timestamp: '2026-04-22 17:50:06' },
      { ID: '4', Type: 'Result', Message: 'Project review feedback live', Timestamp: '2026-04-22 17:50:18' },
      { ID: '5', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
    ];

    const filtered = type
      ? allNotifications.filter((notification) => notification.Type === type)
      : allNotifications;

    const sorted = filtered.sort((a, b) => {
      const weightDiff = priorityWeight[b.Type] - priorityWeight[a.Type];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
    });

    const startIndex = (page - 1) * limit;
    const items = sorted.slice(startIndex, startIndex + limit);

    Log('backend', 'info', 'route', `notifications requested page=${page} limit=${limit} type=${type || 'all'}`);

    res.json({ notifications: items });
  } catch (error) {
    Log('backend', 'error', 'route', `notification endpoint failed: ${(error as Error).message}`);
    res.status(500).json({ error: 'Unable to fetch notifications' });
  }
});

app.listen(port, () => {
  Log('backend', 'info', 'route', `Notification backend running on http://localhost:${port}`);
});
