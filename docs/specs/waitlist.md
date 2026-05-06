# Waitlist Feature Spec

## Overview

A pre-launch SaaS waitlist landing page with:

- Bold, branded marketing landing page with a waitlist signup form
- Hono API handling signups + admin access
- SQLite storage via Drizzle
- Scrappy admin page to view signups

---

## Landing page (`apps/web`)

### Design: bold and branded

- Dark mode, gradients, big typography, magnetic feel
- Hero section with product name/tagline + CTA
- Feature teaser section (3-4 highlights)
- Email + name signup form — prominent, centred or full-width

### Form behaviour

- Client-side validation on email format and non-empty name before submit
- On success: show a confirmation/success message on the same page (replace form or show overlay)
- On error: show specific, inline error messages per field
- Duplicate email returns a clear message: "You're already on the list!"
- Loading state on the submit button while request is in flight

### Form fields

| Field | Required | Validation                      |
| ----- | -------- | ------------------------------- |
| Email | Yes      | Valid email format + uniqueness |
| Name  | Yes      | Non-empty, trimmed              |

---

## API (`apps/api`)

### `POST /api/waitlist`

Submit a waitlist entry.

**Request body:**

```json
{
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

**Validation rules:**

- `email`: valid email format (basic regex), max 255 chars
- `name`: non-empty string after trim, max 100 chars

**Responses:**

| Status | Condition            | Body                                                                                   |
| ------ | -------------------- | -------------------------------------------------------------------------------------- |
| 201    | New entry created    | `{ "id": 1, "email": "...", "name": "..." }`                                           |
| 409    | Email already exists | `{ "error": "duplicate_email", "message": "You're already on the list!" }`             |
| 422    | Validation failure   | `{ "error": "validation_error", "details": [{ "field": "email", "message": "..." }] }` |

### `GET /api/admin/waitlist`

List all waitlist entries, ordered by most recent first.

**Auth:** Bearer token or cookie matching `ADMIN_PASSWORD` env var.

**Response:**

```json
{
  "entries": [{ "id": 1, "email": "user@example.com", "name": "Jane Doe", "createdAt": "..." }],
  "total": 42
}
```

### `GET /api/admin/waitlist/export`

Export all entries as CSV.

**Auth:** Same as above.

**Response:** `Content-Type: text/csv`

---

## Database (`packages/db`)

### `waitlist_entries` table

| Column     | Type    | Constraints                  |
| ---------- | ------- | ---------------------------- |
| id         | integer | PK, autoincrement            |
| email      | text    | NOT NULL, UNIQUE             |
| name       | text    | NOT NULL                     |
| created_at | integer | NOT NULL (Unix ms timestamp) |

Index on `email` (implicit via UNIQUE).

---

## Rate limiting

- IP-based fixed window: 5 requests per IP per hour
- In-memory counter (process-local, not persisted)
- Returns `429 Too Many Requests` when exceeded
- Resets on server restart — acceptable for pre-launch

---

## Admin page (`apps/web`)

### Route: `/admin`

- Password-protected via shared env var (`ADMIN_PASSWORD`)
- Simple form to enter the password if no valid session
- Session stored as a signed cookie (or just a cookie set after password match)
- Displays a table of all signups: name, email, timestamp
- No pagination for MVP (SQLite dataset will be small)
- "Export CSV" link that hits the admin export endpoint

### Auth flow

1. Visitor hits `/admin`
2. No valid cookie → show password form
3. POST password → validate against `ADMIN_PASSWORD` env var
4. On match: set session cookie → redirect to `/admin`
5. `/admin` page fetches data from API (authenticated via same cookie/header)

---

## Error handling expectations

- **All API routes** return structured JSON errors, never HTML or raw exceptions
- **Validation errors** list individual field issues
- **Unexpected errors** return 500 with `{ "error": "internal_error" }` — no stack traces leaked
- **Frontend** handles: loading, empty, error, and success states for every interaction
- **Network failure** on form submit shows a generic "Something went wrong. Please try again." message

---

## Security

- Input validated at the API boundary with Zod
- No raw SQL
- Admin password via env var only, never hardcoded
- Session cookie: `httpOnly`, `sameSite: strict`, ideally signed
- No rate-limit bypass via headers

---

## Out of scope (v1)

- Email sending / confirmation emails
- Referral tracking
- User accounts / full auth system
- Pagination on admin page
- Analytics or conversion tracking
- Captcha / bot protection (rate limiting is enough for pre-launch)
