import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Log } from './logger';

interface NotificationRecord {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

const API_ENDPOINT = 'http://localhost:3001/evaluation-service/notifications';
const TYPE_OPTIONS = ['All', 'Placement', 'Result', 'Event'];

function isPriority(type: string) {
  if (type === 'Placement') return 3;
  if (type === 'Result') return 2;
  if (type === 'Event') return 1;
  return 0;
}

export default function App() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState('All');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);

      const url = new URL(API_ENDPOINT);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('page', String(page));
      if (filterType !== 'All') {
        url.searchParams.set('notification_type', filterType);
      }

      Log('frontend', 'debug', 'api', `fetch notifications page=${page} limit=${limit} type=${filterType}`);

      try {
        // include Authorization header for protected backend
        const apiToken = (import.meta as any).env?.VITE_API_TOKEN || 'test-token';
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Fetch failed (${response.status})`);
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
        Log('frontend', 'info', 'api', `received ${data.notifications?.length ?? 0} notifications`);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        Log('frontend', 'error', 'api', `notification fetch failed: ${message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [limit, page, filterType]);

  const priorityList = [...notifications]
    .sort((a, b) => isPriority(b.Type) - isPriority(a.Type) || new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
    .slice(0, 10);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">Affordmed Notifications</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
          <Stack spacing={2}>
            <Typography variant="h5">Notification inbox</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="filter-type-label">Notification type</InputLabel>
                <Select labelId="filter-type-label" value={filterType} label="Notification type" onChange={(event: SelectChangeEvent) => setFilterType(event.target.value)}>
                  {TYPE_OPTIONS.map((type) => (
                    <MenuItem value={type} key={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Page" type="number" value={page} onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))} sx={{ width: 120 }} />
              <TextField label="Limit" type="number" value={limit} onChange={(event) => setLimit(Math.max(1, Math.min(100, Number(event.target.value) || 10)))} sx={{ width: 120 }} />
              <Button variant="contained" onClick={() => setPage(1)}>Refresh</Button>
            </Stack>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Priority Inbox" />
            <Tab label="All Notifications" />
          </Tabs>
          <Divider sx={{ my: 2 }} />

          {loading && <LinearProgress />}
          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && (
            <Stack spacing={2}>
              {(tab === 0 ? priorityList : notifications).map((notification) => (
                <Paper key={notification.ID} sx={{ p: 2, borderLeft: '4px solid #1976d2' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{notification.Message}</Typography>
                      <Typography color="text.secondary">{notification.Type}</Typography>
                    </Box>
                    <Typography color="text.secondary">{notification.Timestamp}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
