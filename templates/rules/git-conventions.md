# Git Conventions

Follow consistent branching and commit practices for clear history and easier collaboration.

## Branch Naming

- **Feature**: `feat/short-description` or `feature/short-description`
- **Bug fix**: `fix/short-description` or `bugfix/issue-123`
- **Docs**: `docs/short-description`
- **Chore**: `chore/short-description`
- **Hotfix**: `hotfix/short-description` (production fixes)

Use lowercase, hyphens for spaces. Keep names short and descriptive.

## Commit Messages

- Use conventional commits: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci
- Subject: imperative mood, ~50 chars, no period
- Body: explain why when needed; reference issues with `Closes #123`

## Pre-Commit

Before committing:

1. Run lint (fix auto-fixable issues).
2. Run typecheck.
3. Run tests.
4. Ensure no secrets or debug code.

Use `chain` pre-commit hook or project-specific hooks when configured.
