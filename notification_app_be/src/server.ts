import cors from 'cors';
import express from 'express';
import { loggingMiddleware } from 'logging_middleware';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

app.get('/evaluation-service/notifications', (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const type = String(req.query.notification_type || '').trim();
  const allNotifications = [
    { ID: '1', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:42' },
    { ID: '2', Type: 'Result', Message: 'mid-sem results are ready', Timestamp: '2026-04-22 17:50:54' },
    { ID: '3', Type: 'Event', Message: 'TechFest happening tomorrow', Timestamp: '2026-04-22 17:50:06' },
    { ID: '4', Type: 'Result', Message: 'Project review feedback live', Timestamp: '2026-04-22 17:50:18' },
    { ID: '5', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
  ];

  const filtered = type ? allNotifications.filter((notification) => notification.Type === type) : allNotifications;
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  res.json({ notifications: items });
});

app.listen(port, () => {
  console.log(`Notification backend running on http://localhost:${port}`);
});
