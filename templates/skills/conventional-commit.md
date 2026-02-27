# Conventional Commit

Generate conventional commit messages with appropriate type and scope.

## When

Use this skill when:
- The user asks to commit changes.
- Creating a commit message for staged changes.
- The user asks: "commit", "commit message", "git commit".

## How

### 1. Analyze Changes
- Review staged changes (`git diff --staged`).
- Identify the primary type of change.
- Determine scope (module, feature, or file area).

### 2. Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 3. Types

| Type | Emoji | Use for |
|------|-------|---------|
| feat | ✨ | New feature |
| fix | 🐛 | Bug fix |
| docs | 📝 | Documentation only |
| style | 💄 | Formatting, no code change |
| refactor | ♻️ | Code change, no feature/fix |
| perf | ⚡ | Performance improvement |
| test | ✅ | Adding or updating tests |
| chore | 🔧 | Build, config, tooling |
| ci | 👷 | CI/CD changes |

### 4. Subject Rules

- Imperative mood: "add" not "added" or "adds".
- No period at the end.
- 50 chars or less.
- Lowercase (except proper nouns).

### 5. Body (optional)

- Explain *why* and *what*, not *how*.
- Wrap at 72 characters.
- Reference issues: `Closes #123`, `Fixes #456`.

### 6. Examples

```
✨ feat(auth): add OAuth2 login flow
🐛 fix(api): handle null response in user endpoint
📝 docs(readme): update installation instructions
♻️ refactor(db): optimize query performance
```

## Constraints

- Prefer one logical change per commit.
- Run pre-commit checks (lint, test) before committing unless `--no-verify` is requested.
- Never commit secrets or sensitive data.
