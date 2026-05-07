# launchpad-dev

Development toolkit for the Launchpad waitlist project. Provides agents, slash commands, and skills for Hono API development, security review, code review, and session retros.

## Components

### Agents

| Agent               | Description                                                                                                                                                          | Tools                         | Model  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------ |
| `security-reviewer` | Audits code for input validation, auth bypass, injection, exposed secrets, and insecure cookies. Outputs Critical / Warning / Suggestion. Blocks on Critical issues. | Read, Glob, Grep              | sonnet |
| `api-developer`     | Builds Hono API endpoints with Zod validation, Drizzle ORM, and the project's structured error response format.                                                      | Read, Write, Edit, Bash, Glob | sonnet |

### Slash Commands

| Command   | Description                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/review` | Structured code review against `main` — checks type safety, error handling, security, and spec compliance (`docs/specs/waitlist.md`). Outputs Critical / Warning / Suggestion. |
| `/retro`  | Invokes the retro skill — captures session learnings into CLAUDE.md and SOUL.md.                                                                                               |
| `/ship`   | Orchestration command: runs `/review`, then security-reviewer agent. Blocks if either finds Critical issues. If clean, offers to commit and push.                              |

### Skills

| Skill   | Description                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retro` | End-of-session retrospective. Scans session context for corrections, errors, and patterns. Categorizes learnings into CLAUDE.md (project constraints), SOUL.md (engineering patterns), and skill suggestions. |

## Setup

### 1. Install the plugin

Add to `.claude/settings.json`:

```json
{
  "plugins": ["launchpad-dev"]
}
```

### 2. Add the PostToolUse hook (optional but recommended)

This hook runs Prettier on every file you edit, keeping formatting consistent:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "^(Edit|Write)$",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write --ignore-path .gitignore \"$CLAUDE_FILE_PATH\" 2>/dev/null"
          }
        ]
      }
    ]
  }
}
```

Add this to your project's `.claude/settings.json` under the `"hooks"` key.

## Requirements

- Node.js 20+
- pnpm
- Prettier (for the PostToolUse hook)
