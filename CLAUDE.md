# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev           # Run all workspaces in parallel (API :3001, Web :3000)
pnpm build         # Build all workspaces
pnpm lint          # ESLint across all workspaces
pnpm format:fix    # Prettier whole project
pnpm --filter @launchpad/db exec drizzle-kit generate  # Generate SQL migration
pnpm --filter @launchpad/db exec drizzle-kit migrate   # Apply migrations
```

## Architecture

**pnpm monorepo** with 3 workspaces, strict TypeScript throughout:

- **apps/web** — Next.js 14 App Router + Tailwind. Entry at `src/app/page.tsx`. Transpiles `@launchpad/db` via `next.config.js`.
- **apps/api** — Hono on Node.js served via `@hono/node-server`. Dev mode uses `tsx watch`. Exposes `GET /health` at `:3001` by default.
- **packages/db** — Drizzle ORM with better-sqlite3 (WAL mode). SQLite file lives at `data/launchpad.db` (gitignored). Schema in `src/schema.ts` — currently one table `waitlist_entries`. Exports a `db` drizzle instance and the `Db` type.

### Key integration points

- The API imports `@launchpad/db` as a workspace dependency (`"workspace:*"` in package.json).
- The web app can also import `@launchpad/db` via `next.config.js`'s `transpilePackages`.
- Drizzle config reads schema from `src/schema.ts` and outputs migrations to `drizzle/`.

### Non-obvious constraints

- DB path resolves to repo root `data/launchpad.db` via `resolve(import.meta.dirname, '../../../data/launchpad.db')` in `packages/db/src/index.ts` — three levels up: `src/` → `db/` → `packages/` → root. The `data/` directory must exist before the first migration or it will fail.
- pnpm `onlyBuiltDependencies` allows `better-sqlite3` and `esbuild` native builds — adding a new native dep needs an entry there.
- The API uses `@hono/node-server`, not a framework like Express — all middleware is Hono-native.

## Workflow rules

- Always work on a feature branch, never commit to main directly
- Use conventional commits: feat:, fix:, refactor:, docs:, chore:
- Run `pnpm lint` before finishing any task
- Keep functions under 30 lines
- No `any` in TypeScript — ever
- All API routes must validate input with Zod
- Never commit .env files

## Agent behaviour

- Read SOUL.md at the start of every session
- Separate planning from execution — always show a plan and wait for approval before writing code
- After two failed correction attempts, stop and ask for clearer instructions

## Hooks

Two hooks are configured in `.claude/settings.json`:

- **PostToolUse** — Runs `prettier --write` on any file modified by `Edit` or `Write` tools. Keeps formatting consistent without manual `pnpm format:fix` runs.
- **Stop** — Runs `pnpm lint` (skipping `@launchpad/web` filter) and `pnpm build` on session stop. If either fails, the session exit is blocked with exit code 1, preventing bad state from being committed.
