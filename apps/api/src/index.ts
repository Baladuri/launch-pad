import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running at http://localhost:${port}`);
});

export default app;
