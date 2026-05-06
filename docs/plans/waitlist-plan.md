# Waitlist Feature — Implementation Plan

## Strategy

Three vertical slices, each independently testable end-to-end. No horizontal layers (no "do all DB first, then all API, then all UI"). Every slice ships working value.

---

## Phase 1: Signup Flow

_DB migration + API endpoint + landing page form — the core user-facing feature._

### DB

- Ensure `data/` directory exists
- Generate and run Drizzle migration for `waitlist_entries` table (schema exists, migration likely stale/new)

### API — `POST /api/waitlist`

- Add Zod schema: `{ email: z.string().email().max(255), name: z.string().trim().min(1).max(100) }`
- Handler: insert → 201, duplicate email (UNIQUE constraint) → 409, validation failure → 422
- Structured JSON errors for all paths (201, 409, 422, 500)
- Wire into Hono app under `/api` prefix

### UI — Landing page (`apps/web/src/app/page.tsx`)

- Bold dark-mode hero: tagline, 3-4 feature teasers, prominent signup form
- Form fields: email + name, client-side validation before submit
- States on submit: loading (button spinner), success (replace form with confirmation message), error (inline field messages), duplicate (specific "You're already on the list!" message), network failure (generic fallback)

### Test

1. `pnpm dev` — landing page loads with form
2. Submit with valid data → 201, success message shown
3. Submit same email again → "You're already on the list!"
4. Submit with bad email → inline validation error
5. Submit with empty name → inline validation error

---

## Phase 2: Admin Page

_Admin API endpoints + password-gated admin UI — operator value without shipping email infrastructure._

### API — Auth middleware

- Check `ADMIN_PASSWORD` env var
- `POST /api/admin/login` — validate password, set `httpOnly` + `sameSite: strict` session cookie
- Middleware for protected endpoints: reject if no valid session cookie

### API — `GET /api/admin/waitlist`

- Return entries ordered by `createdAt` desc, with `total` count
- Protected by auth middleware
- JSON response matching spec

### API — `GET /api/admin/waitlist/export`

- Same auth guard
- Return `Content-Type: text/csv` with all entries

### UI — `/admin` route

- New route: `apps/web/src/app/admin/page.tsx`
- No valid cookie → show password form (POST to API login endpoint)
- On auth success → redirect to `/admin`, fetch entries from API
- Table: name, email, timestamp columns, sorted newest first
- "Export CSV" link hitting the export endpoint
- States: loading (skeleton/spinner), empty (no signups yet — welcome message), populated (table), auth error

### Test

1. Visit `/admin` → see password form
2. Enter wrong password → error shown
3. Enter correct password → see entries table (or empty state)
4. Submit signup on landing page → refresh admin → entry appears
5. Click "Export CSV" → CSV downloads

---

## Phase 3: Rate Limiting

_In-memory IP-based rate limiter + 429 handling on the frontend._

### API — Rate limiter middleware

- Fixed window: 5 requests per IP per hour
- In-memory `Map<string, { count: number; windowStart: number }>`
- Apply to `POST /api/waitlist` only
- Returns `429 Too Many Requests` with `{ "error": "rate_limited", "message": "Too many requests. Please try again later." }`
- Respects `X-Forwarded-For` or falls back to request IP
- Cleanup: periodic sweep of expired windows to prevent memory leak

### UI — 429 handling on signup form

- When form submit gets 429 → show rate-limit message above the form
- Keep form visible (user hasn't done anything wrong per-se)

### Test

1. Submit POST /api/waitlist 6 times rapidly → 6th returns 429
2. Frontend shows rate-limit message
3. (Optional) Verify counter resets after window expiry

---

## Dependencies & Ordering

```
Phase 1 ──► Phase 2 ──► Phase 3
```

- Phase 2 depends on Phase 1 (needs the table with data to test admin meaningfully)
- Phase 3 is independent of Phase 2 (could be done before or after — I put it last because it's the most isolated and lowest-risk)

---

## Files changed (summary)

| Phase | File                              | Change                                            |
| ----- | --------------------------------- | ------------------------------------------------- |
| 1     | `packages/db/drizzle/`            | New migration file (generated)                    |
| 1     | `apps/api/src/index.ts`           | Add POST /api/waitlist route                      |
| 1     | `apps/web/src/app/page.tsx`       | Full landing page with form                       |
| 1     | `apps/web/src/app/globals.css`    | Dark-mode theme variables                         |
| 2     | `apps/api/src/index.ts`           | Add auth middleware, admin routes, login endpoint |
| 2     | `apps/web/src/app/admin/page.tsx` | New admin page                                    |
| 3     | `apps/api/src/index.ts`           | Add rate limiter middleware                       |
| 3     | `apps/web/src/app/page.tsx`       | Handle 429 state                                  |
