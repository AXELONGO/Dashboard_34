import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  createClient,
  createClientHistory,
  createHistory,
  createLead,
  getClients,
  getClientsHistory,
  getHistory,
  getLeads,
  getSupportTickets,
  updatePage
} from './services/notionService.js';
import { generateLeads } from './services/aiService.js';

const app = express();
const PORT = Number(process.env.PORT || 8000);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'backend_react' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Sales Dashboard JS backend is running' });
});

app.post(
  '/api/ai/generate-leads',
  asyncHandler(async (req, res) => {
    const { location } = req.body ?? {};
    res.json(await generateLeads(location));
  })
);

app.get(
  '/api/leads',
  asyncHandler(async (_req, res) => {
    res.json(await getLeads());
  })
);

app.post(
  '/api/leads',
  asyncHandler(async (req, res) => {
    res.json(await createLead(req.body));
  })
);

app.get(
  '/api/history',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    res.json(await getHistory(startDate, endDate));
  })
);

app.post(
  '/api/history',
  asyncHandler(async (req, res) => {
    res.json(await createHistory(req.body));
  })
);

app.get(
  '/api/clients',
  asyncHandler(async (_req, res) => {
    res.json(await getClients());
  })
);

app.post(
  '/api/clients',
  asyncHandler(async (req, res) => {
    res.json(await createClient(req.body));
  })
);

app.get(
  '/api/clients/history',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    res.json(await getClientsHistory(startDate, endDate));
  })
);

app.post(
  '/api/clients/history',
  asyncHandler(async (req, res) => {
    res.json(await createClientHistory(req.body));
  })
);

app.get(
  '/api/support-tickets',
  asyncHandler(async (_req, res) => {
    res.json(await getSupportTickets());
  })
);

app.patch(
  '/api/pages/:pageId',
  asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    res.json(await updatePage(pageId, req.body));
  })
);

app.post(
  '/api/webhook',
  asyncHandler(async (req, res) => {
    const webhookUrl = 'https://automatizaciones-n8n.tzudkj.easypanel.host/webhook/COTIZACION';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({ error: 'Webhook failed', details });
    }

    res.json({ success: true });
  })
);

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error('[backend_react] Unhandled error:', err);
  const message = err instanceof Error ? err.message : 'Unknown server error';
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Backend JS listening on port ${PORT}`);
});
