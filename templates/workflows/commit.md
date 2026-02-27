# Workflow: Commit

## Goal

Commit staged changes with a conventional commit message after running pre-commit checks.

## Process

1. **Check Staged Changes:** Run `git status` and `git diff --staged` to see what will be committed.
2. **Pre-Commit Checks:** Run the project's verification commands:
   - Lint (e.g. `npm run lint` or `bun run lint`)
   - Typecheck (e.g. `npm run typecheck` or `tsc --noEmit`)
   - Tests (e.g. `npm test` or `bun test`)
3. **Fix Issues:** If any check fails, fix the issues before committing. Do not use `--no-verify` unless the user explicitly requests it.
4. **Generate Message:** Based on the staged changes, generate a conventional commit message:
   - Type: feat, fix, docs, style, refactor, perf, test, chore, ci
   - Scope: module or area affected (optional)
   - Subject: imperative mood, ~50 chars, no period
   - Body: explain why when needed; reference issues with `Closes #123`
5. **Commit:** Run `git commit -m "message"` or `git commit` with the generated message.

## Output

- A passing pre-commit state.
- A conventional commit message.
- The commit executed (or the exact command for the user to run).
