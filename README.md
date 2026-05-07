# LaunchPad

A production-ready pre-launch waitlist boilerplate for SaaS products. Dark-mode landing page with email capture, a Hono API with built-in rate limiting, SQLite storage via Drizzle, and a password-protected admin dashboard. Clone it, swap the branding, deploy — ship your waitlist in an afternoon.

## Demo

![LaunchPad screenshot](docs/screenshot.png)

<!-- Replace with a real screenshot of the landing page.
     The page renders a dark hero with "LaunchPad", a tagline,
     feature bullets, and a name/email signup form. -->

Visit `https://your-site.com/admin` after setting `ADMIN_PASSWORD` to view signups in a sortable table and export them as CSV.

---

## Tech stack

| Layer      | Choice                                |
| ---------- | ------------------------------------- |
| Framework  | Next.js 14 (App Router)               |
| Styling    | Tailwind CSS                          |
| API        | Hono on Node.js (`@hono/node-server`) |
| Database   | SQLite (better-sqlite3, WAL mode)     |
| ORM        | Drizzle                               |
| Validation | Zod                                   |
| Monorepo   | pnpm workspaces                       |
| Language   | TypeScript (strict mode, no `any`)    |

## Project structure

```
launchpad/
├── apps/
│   ├── web/                    # Next.js landing page + admin UI
│   │   └── src/app/
│   │       ├── page.tsx        # Landing page (hero + signup form)
│   │       ├── admin/page.tsx  # Password-protected admin dashboard
│   │       └── layout.tsx      # Root layout
│   └── api/                    # Hono API server
│       └── src/index.ts        # All routes (waitlist, admin auth, CSV export)
├── packages/
│   └── db/                     # Shared database package
│       ├── src/schema.ts       # Drizzle schema (waitlist_entries table)
│       └── src/index.ts        # Drizzle client (better-sqlite3)
├── data/                       # SQLite database file location (gitignored)
├── docs/
│   ├── specs/waitlist.md       # Full feature spec
│   └── plans/waitlist-plan.md  # Implementation plan
├── package.json                # Root scripts (dev, build, lint)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Getting started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9

### Clone and install

```sh
git clone https://github.com/your-username/launchpad.git
cd launchpad
pnpm install
```

### Environment variables

```sh
cp .env.example .env
```

Edit `.env` and set `ADMIN_PASSWORD` to a strong password — this protects the admin dashboard.

### Initialize the database

```sh
mkdir -p data
pnpm --filter @launchpad/db exec drizzle-kit generate
pnpm --filter @launchpad/db exec drizzle-kit migrate
```

The SQLite database file lives at `data/launchpad.db`. WAL mode is enabled automatically.

### Start developing

```sh
pnpm dev
```

This starts both servers in parallel:

- **Web**: http://localhost:3000 (Next.js)
- **API**: http://localhost:3001 (Hono)

The Next.js dev server proxies `/api/*` requests to the Hono API automatically via `next.config.js` rewrites.

---

## Available scripts

| Script            | Description                               |
| ----------------- | ----------------------------------------- |
| `pnpm dev`        | Run all workspaces in parallel (dev mode) |
| `pnpm build`      | Build all workspaces                      |
| `pnpm lint`       | ESLint across all workspaces              |
| `pnpm format:fix` | Prettier (entire project)                 |
| `pnpm format`     | Check formatting (CI-safe)                |

---

## API endpoints

### `GET /health`

Returns `{ "status": "ok" }`. Use for uptime monitoring.

### `POST /api/waitlist`

Submit a waitlist entry. Rate-limited to **5 requests per IP per hour** (in-memory, resets on server restart).

```json
// Request
{ "email": "user@example.com", "name": "Jane Doe" }

// 201 Created
{ "id": 1, "email": "user@example.com", "name": "Jane Doe" }

// 409 Conflict — duplicate email
{ "error": "duplicate_email", "message": "You're already on the list!" }

// 422 Validation error
{ "error": "validation_error", "details": [{ "field": "email", "message": "Invalid email format" }] }

// 429 Rate limited
{ "error": "rate_limited", "message": "Too many requests. Please try again later." }
```

### `POST /api/admin/login`

Authenticate with the shared `ADMIN_PASSWORD`. Sets an `httpOnly`, `sameSite: strict` session cookie (HMAC-signed, 24-hour expiry).

```json
// Request
{ "password": "your-admin-password" }

// 200 OK
{ "success": true }

// 401 Unauthorized
{ "error": "invalid_password", "message": "Invalid password" }
```

### `GET /api/admin/waitlist`

List all waitlist entries, ordered by most recent first. Requires a valid admin session cookie.

```json
// 200 OK
{
  "entries": [{ "id": 1, "email": "user@example.com", "name": "Jane Doe", "createdAt": "..." }],
  "total": 42
}
```

### `GET /api/admin/waitlist/export`

Download all entries as CSV. Requires a valid admin session cookie.

```
name,email,created_at
Jane Doe,user@example.com,1700000000000
```

---

## Admin access

Visit `/admin` on the web app. You'll be prompted for the password set in `ADMIN_PASSWORD`. Once authenticated, you can:

- View all signups in a table (name, email, signup date)
- Export signups as CSV
- See total count of entries

The session lasts 24 hours. Log out by clearing the cookie (there's no logout endpoint — it's a pre-launch MVP).

---

## Customizing for your own idea

This is meant to be forked, not configured. Here's what to swap:

1. **Branding** — Edit `apps/web/src/app/page.tsx`:
   - Change the `h1` text from "LaunchPad" to your product name
   - Update the tagline and feature bullets
   - Tweak the color scheme in `tailwind.config.ts` (or just use inline classes)

2. **Add waitlist logic** — The `/api/waitlist` POST handler currently returns 501. Wire it to the database:

   ```ts
   // apps/api/src/index.ts
   app.post('/api/waitlist', rateLimit, async (c) => {
     // validate with Zod, insert via drizzle, handle duplicates
   });
   ```

3. **Meta tags** — Update the title and description in `apps/web/src/app/layout.tsx`

4. **Favicon** — Replace `favicon.ico` in `apps/web/public/` (it doesn't exist yet — create one)

That's it. No build tool config, no CI pipeline, no domain setup needed for local development.

---

## Deployment

### Web app → Vercel

```sh
# Install Vercel CLI or connect via Vercel dashboard
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` if your API is on a different domain (not needed if using rewrites).

**Important**: Next.js rewrites (`/api/*` → `localhost:3001`) only work in development. In production, point rewrites to your deployed API URL by updating `next.config.js`:

```js
// apps/web/next.config.js
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

module.exports = {
  transpilePackages: ['@launchpad/db'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};
```

### API server → Railway or Fly.io

The API is a standalone Node.js server (`@hono/node-server`). Deploy it anywhere you'd run a Node process:

- **Railway** — Connect the repo, set build command to `pnpm build`, start command to `node apps/api/dist/index.js`, add `ADMIN_PASSWORD` and `NODE_ENV=production` as environment variables.
- **Fly.io** — Add a `Dockerfile` (or use `fly launch` with Node), same env vars.

### Database

SQLite (`data/launchpad.db`) is stored on disk. For pre-launch, this is fine. If you need persistence across deploys, either:

- Mount a persistent volume (Railway/Fly both support this)
- Swap to PostgreSQL (Drizzle makes this a schema import change)

---

## What's deliberately out of scope

- **Email sending** — No SMTP, no transactional email integration. Export the CSV and import into your email tool.
- **Referral tracking** — No referral codes or invite links.
- **User accounts** — No registration, no password resets, no OAuth. The admin is a single shared password.
- **Pagination** — The admin view loads all entries at once. Fine for pre-launch volumes.
- **Captcha / bot protection** — IP-based rate limiting covers the pre-launch case. Add Cloudflare Turnstile or reCAPTCHA if bots become a problem.
- **CI/CD** — No GitHub Actions, no test runner. Add what you need for your workflow.

## Known issues

- Admin login has no rate limiting — brute-force protection should be added before production
- CSV export doesn't escape commas, quotes, or newlines in name/email fields

---

_Built with Next.js, Hono, Drizzle, SQLite, and pnpm._
