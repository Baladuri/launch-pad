---
name: retro
description: Run a retrospective on the current session — capture learnings, surface project constraints for CLAUDE.md, engineering patterns for SOUL.md, and workflow suggestions for new skills
---

# Retro Skill

Run this at the end of every session to extract durable value from the work done.

## Instructions

1. **Scan the session context.** Review tool calls, edits, errors, user corrections, and decisions made. Pay special attention to:
   - User corrections ("don't do X", "no, do it like Y")
   - Directions the user confirmed as correct ("yes exactly")
   - Errors encountered and how they were resolved
   - Non-obvious constraints discovered about the project
   - Patterns or techniques that worked well and should be repeated

2. **Categorize learnings into three buckets:**

   ### Bucket A: Project constraints → CLAUDE.md
   - Anything future sessions must know to avoid mistakes
   - Environment quirks, configuration gotchas, dependency surprises
   - Architecture decisions or API design constraints
   - Commands, scripts, or workflows that are easy to get wrong
   - _Append these directly to CLAUDE.md under the appropriate section_

   ### Bucket B: Engineering patterns → SOUL.md
   - Code patterns that proved robust
   - Testing strategies that caught real bugs
   - Trade-off decisions that aged well
   - Anti-patterns to avoid
   - _Append these directly to SOUL.md under the relevant values section_

   ### Bucket C: Reusable workflows → New skill suggestions
   - Multi-step processes performed more than once
   - Patterns that could be codified into a client skill
   - _Output these as suggestions — do not create the skills_

3. **Output a structured retro summary** with these sections:

   ```
   ## Retro — YYYY-MM-DD

   ### What went wrong
   - Bullet list of issues, errors, missteps

   ### What was learned
   - Bullet list of key learnings

   ### What was fixed
   - Bullet list of bugs quashed, improvements made, tech debt addressed

   ### CLAUDE.md updates
   - Specific items appended with exact section targets

   ### SOUL.md updates
   - Specific items appended with exact section targets

   ### Skill suggestions
   - Bullet list of reusable workflow ideas
   ```

4. **Append to CLAUDE.md** any items that are durable project constraints. Insert them under the most relevant section heading (e.g., "Non-obvious constraints", "Commands", "Architecture"). If the section already exists, add after the last item. Use the format:

   ```
   - (retro YYYY-MM-DD) item description
   ```

5. **Append to SOUL.md** any items that are durable engineering patterns. Insert under the most relevant values section. Use the format:

   ```
   - (retro YYYY-MM-DD) pattern description
   ```

6. **Final check.** Confirm all edits were applied successfully by reading the last few lines of the files modified.
