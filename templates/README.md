# Chain Starter Templates

These templates are **starter defaults** for new users. During `chain init`, they are copied to `.chain/` in your project. Existing files are never overwritten.

## Purpose

- **New users** get a working baseline without starting from scratch
- **Standards** — common skills, rules, and workflows that apply to most projects
- **Customize** — edit in `.chain/` or replace with your own
- **Share** — use `content_sources` (e.g. `~/.chain-hub`) for cross-project content

## What Gets Copied

| Category | Contents |
|----------|----------|
| **rules/** | Project conventions, user preferences, skill router, error handling, git conventions |
| **skills/** | Code review, debugging, refactoring, testing, security, commits, docs, bug fixes |
| **workflows/** | PRD creation, task generation, refactor planning, bug fix, GitHub issues, commit |

## Skills (10)

| Skill | Use when |
|-------|----------|
| `code-review.md` | Reviewing code, PR feedback |
| `debug-assistant.md` | Debugging bugs, finding root causes |
| `refactor.md` | Refactoring without changing behavior |
| `finding-refactor-candidates.md` | Identifying code to refactor |
| `verifying-responsiveness.md` | Verify responsive design across viewports |
| `write-tests.md` | Adding tests, TDD for new features |
| `security-checklist.md` | Security review, vulnerability audit |
| `conventional-commit.md` | Creating commit messages |
| `documentation.md` | README, API docs, inline comments |
| `bug-fix.md` | Fixing bugs with failing-test-first |

## Rules (5)

| Rule | Description |
|------|-------------|
| `project-conventions.md` | SSOT load order, code style, package manager |
| `user-preferences.md` | User-level defaults |
| `skill-router.md` | Routes tasks to the right skill |
| `error-handling.md` | Clear errors, no crashes on config errors |
| `git-conventions.md` | Branch naming, commit style, pre-commit |

## Workflows (6)

| Workflow | Use when |
|----------|----------|
| `create-prd.md` | Creating a Product Requirements Document |
| `generate-tasks.md` | Breaking down a PRD into tasks |
| `refactor-prd.md` | Planning a refactoring project |
| `bug-fix.md` | Issue → branch → failing test → fix → commit |
| `write-github-issue.md` | Feature description → structured GitHub issue |
| `commit.md` | Staged changes → pre-commit checks → conventional commit |

## Stacks (Config Templates)

The `stacks/` folder contains config templates for `extends:` in chain.yaml:

```yaml
extends:
  - stacks/nextjs
  - stacks/react
```

These provide tech_stack defaults (language, framework, database, runtime).

## Beyond the Starter Set

- Add your own skills in `.chain/skills/`
- Use `content_sources` (e.g. `~/.chain-hub`) to share content across projects
- Override any template by editing the file in `.chain/`
