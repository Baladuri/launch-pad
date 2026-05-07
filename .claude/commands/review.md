# Code Review

Run a structured code review on the current branch. Checks all files changed against `main`.

## Process

1. Get the diff against main: `git diff main...HEAD --stat` then `git diff main...HEAD`
2. Read the spec at `docs/specs/waitlist.md`
3. For each changed file, check:

### Type safety

- No `any` anywhere (project rule)
- Strict TypeScript — no unsafe casts, `as` used only with Guards

### Error handling

- No unhandled promise rejections
- API routes return structured JSON errors, never raw exceptions or HTML
- All states handled: loading, empty, error, success (frontend)
- Network errors catch and show user-facing message

### Security

- All API inputs validated with Zod at the boundary
- No raw SQL
- Admin password from env var only (`ADMIN_PASSWORD`), never hardcoded
- Session cookies: `httpOnly`, `sameSite: strict`
- No rate-limit bypass via headers
- No secrets or .env files committed

### Spec compliance (docs/specs/waitlist.md)

- Confirm API routes match the spec: paths, methods, status codes, response shapes
- Confirm form validations and field rules match the spec
- Confirm DB schema columns, types, and constraints match the table definition
- Confirm rate limiting rules match the spec

4. Output findings grouped by severity:

   **Critical** — Must fix before merge (e.g. broken types, security hole, spec violation)
   **Warning** — Should address but non-blocking (e.g. missing edge-case handling)
   **Suggestion** — Nice-to-have improvement (e.g. minor refactor, naming)

5. If any Critical issues are found, output `BLOCKED: Critical issues remain` and exit with a blocking message. Do not proceed.
