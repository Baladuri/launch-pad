import { Hono, type Context, type Next } from 'hono';
import { serve } from '@hono/node-server';
import { getCookie, setCookie } from 'hono/cookie';
import { createHmac } from 'node:crypto';
import { desc } from 'drizzle-orm';
import { db } from '@launchpad/db';
import { waitlistEntries } from '@launchpad/db/schema';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD environment variable is required');
  process.exit(1);
}
const ADMIN_SECRET: string = ADMIN_PASSWORD;

function sign(value: string): string {
  return createHmac('sha256', ADMIN_SECRET).update(value).digest('hex');
}

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));

app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json<{ password: string }>();

  if (password !== ADMIN_SECRET) {
    return c.json(
      { error: 'invalid_password', message: 'Invalid password' },
      401,
    );
  }

  setCookie(c, 'admin_session', sign(password), {
    httpOnly: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 86400,
  });

  return c.json({ success: true });
});

async function adminAuth(c: Context, next: Next) {
  const token = getCookie(c, 'admin_session');

  if (!token || token !== sign(ADMIN_SECRET)) {
    return c.json(
      { error: 'unauthorized', message: 'Not authorized' },
      401,
    );
  }

  await next();
}

const admin = new Hono();

admin.use('*', adminAuth);

admin.get('/waitlist', async (c) => {
  const entries = await db
    .select()
    .from(waitlistEntries)
    .orderBy(desc(waitlistEntries.createdAt));

  return c.json({ entries, total: entries.length });
});

admin.get('/waitlist/export', async (c) => {
  const entries = await db
    .select()
    .from(waitlistEntries)
    .orderBy(desc(waitlistEntries.createdAt));

  const header = 'name,email,created_at';
  const rows = entries.map(
    (e) => `${e.name},${e.email},${e.createdAt.toISOString()}`,
  );

  c.header('Content-Type', 'text/csv');
  c.header(
    'Content-Disposition',
    'attachment; filename="waitlist-export.csv"',
  );

  return c.body([header, ...rows].join('\n'));
});

app.route('/api/admin', admin);

const port = parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running at http://localhost:${port}`);
});

export default app;
