# Ship

Run the full release checklist — code review then security review. Block if either finds Critical issues. If clean, offer to commit and push.

## Process

1. Run the review command: check diff against `main`, check type safety, error handling, security, and spec compliance against `docs/specs/waitlist.md`.
2. If any Critical findings, output `SHIP_BLOCKED: Review found Critical issues` and stop.
3. Run the security-reviewer agent: audit for input validation, auth bypass, injection, exposed secrets, and insecure cookies.
4. If any Critical findings, output `SHIP_BLOCKED: Security review found Critical issues` and stop.
5. If both pass cleanly, output `SHIP_READY: All checks passed`. Present a summary of changes and offer to stage, commit, and push.
