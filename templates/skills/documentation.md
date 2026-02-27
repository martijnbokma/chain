# Documentation

Create or improve documentation: README, API docs, inline comments, and guides.

## When

Use this skill when:
- The user asks to document code or a feature.
- Adding a new module or public API.
- README or docs are outdated or missing.
- The user asks: "document", "add docs", "README", "comment this".

## How

### 1. Identify Scope

- **README**: Project overview, setup, usage, contributing.
- **API docs**: Public functions, types, parameters, return values.
- **Inline comments**: Complex logic, non-obvious decisions, workarounds.
- **Guides**: How-to, tutorials, architecture.

### 2. README Structure

- **Title & description**: What the project does.
- **Installation**: How to install (package manager, env vars).
- **Quick start**: Minimal example to run.
- **Usage**: Common workflows and options.
- **Configuration**: Key options and defaults.
- **Contributing**: How to contribute (if applicable).

### 3. API Documentation

- Function/module purpose.
- Parameters with types and descriptions.
- Return value and possible errors.
- Usage example when helpful.
- Use JSDoc, TSDoc, or project convention.

### 4. Inline Comments

- Explain *why*, not *what* (code shows what).
- Document assumptions and invariants.
- Note workarounds and their reasons.
- Avoid redundant comments.

### 5. Style

- Clear, concise language.
- Active voice.
- Consistent formatting.
- Code examples where useful.

## Constraints

- Match existing documentation style in the project.
- Keep docs close to code (co-locate when possible).
- Update docs when behavior changes.
- No placeholder or TODO-only docs.
