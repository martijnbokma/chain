# Chain — Complete Mastery Guide

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Configuration](#configuration)
4. [Writing Content](#writing-content)
5. [Project Context (PROJECT.md)](#project-context-projectmd)
6. [Editor Setup](#editor-setup)
7. [Using Templates](#using-templates)
8. [Built-in Skill & Workflow Templates](#built-in-skill--workflow-templates)
9. [Custom Editors](#custom-editors)
10. [Content Sources (shared rules)](#content-sources-shared-rules-across-projects)
11. [MCP Servers](#mcp-servers)
12. [Editor Settings](#editor-settings)
13. [Monorepo Setup](#monorepo-setup)
14. [CI/CD Integration](#cicd-integration)
15. [Command Reference](#command-reference)

---

## Installation

### Option 1: npm Package (recommended)

```bash
npm install @silverfox14/chain
npx @silverfox14/chain init
npx @silverfox14/chain sync

# Or with Bun
bun add @silverfox14/chain
bunx @silverfox14/chain init
bunx @silverfox14/chain sync
```

### Option 2: Run directly (no install needed)

```bash
npx @silverfox14/chain init
npx @silverfox14/chain sync

# Or with Bun
bunx @silverfox14/chain init
bunx @silverfox14/chain sync
```

### Option 3: As devDependency (for teams)

```bash
bun add -D @silverfox14/chain

# Or with npm/pnpm
npm install -D @silverfox14/chain
pnpm add -D @silverfox14/chain
```

### Option 4: Install globally

```bash
npm install -g @silverfox14/chain
# or
bun add -g @silverfox14/chain

# Use from anywhere
chain init
chain sync
```

### Option 5: Link locally (for development)

If the package is not yet on npm, or you want to test a local version:

```bash
# In the chain repo:
cd /path/to/chain
bun link

# In your project:
cd /path/to/my-project
bun link @silverfox14/chain
```

Now you can use `bun chain init` and `bun chain sync` as if it were installed.

---

## Getting Started

### Step 1: Initialize your project

```bash
cd /path/to/your/project
bunx chain init
```

The wizard auto-detects your tech stack (language, framework, runtime, database) and asks you to confirm. You only need to pick your editors — everything else is automatic.

For teams with shared rules across projects, use the advanced wizard:

```bash
bunx chain init --advanced
```

This creates:
- `chain.yaml` — your configuration file
- `.chain/PROJECT.md` — project context (included in prompts)
- `.chain/rules/` — project rules
- `.chain/skills/` — AI skills/commands
- `.chain/workflows/` — development workflows

Plus example files:
- `.chain/rules/project-conventions.md`
- `.chain/skills/code-review.md`, `debug-assistant.md`, `finding-refactor-candidates.md`, `refactor.md`, `verifying-responsiveness.md`
- `.chain/workflows/create-prd.md`, `generate-tasks.md`, `refactor-prd.md`

Automatic DX setup (when possible):
- **package.json** — adds `sync`, `sync:dry`, and `sync:watch` scripts
- **.git/hooks/pre-commit** — installs auto-sync hook (if `.git/` exists)

### Step 2: Configure your editors

Open `chain.yaml` and enable the MCP-capable editors you use:

```yaml
version: "1.0"

editors:
  cursor: true
  claude: true
  # Set to true for the ones you use:
  kiro: false
  copilot: false
  roo: false
  kilocode: false
  amazonq: false

metadata:
  name: "My Project"
  description: "Short description of your project"

tech_stack:
  language: typescript
  framework: nextjs
  database: supabase
```

### Step 3: Sync MCP configs

```bash
bunx chain sync
```

Output:
```
✔ Configuration loaded
✔ Generated MCP configs for 2 editor(s): cursor, claude
✔ Sync complete!
```

This generates `.cursor/mcp.json`, `.claude/settings.json`, etc. with the Chain MCP server. Content is served live from `.chain/` — no file copying.

### Step 4: Use prompts in your editor

Open your project in Cursor, Claude Code, or another MCP-capable editor. Select `@chain_full_context`, `@chain_rules`, `@chain_skills`, or `@chain_workflows` when you need them.

---

## Configuration

### Full `chain.yaml` reference

```yaml
version: "1.0"

# Template inheritance (optional)
extends:
  - stacks/nextjs

# Which MCP-capable editors are active
editors:
  cursor: true
  claude: true
  kiro: false
  copilot: false
  roo: false
  kilocode: false
  amazonq: false

# Project metadata (appears in entry points)
metadata:
  name: "My Project"
  description: "Description for AI editors"

# Tech stack (appears in entry points)
tech_stack:
  language: typescript
  framework: nextjs
  database: supabase
  runtime: node

# MCP servers (distributed to editors that support them)
mcp_servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    enabled: true

# Editor settings (generates .editorconfig + .vscode/settings.json)
settings:
  indent_size: 2
  indent_style: space
  format_on_save: true

# Ignore patterns (for templates)
ignore_patterns:
  - node_modules/
  - .next/
  - dist/

# Content sources (shared rules across projects)
content_sources:
  - type: local
    path: ../shared-ai-rules
    include: [rules, skills, workflows]  # optional filter
  - type: package
    name: "@my-org/ai-rules"

# Custom editors (must have mcp_config_path for MCP-only)
custom_editors:
  - name: my-editor
    mcp_config_path: .my-editor/mcp.json
```

---

## Writing Content

### Rules (project rules)

Files in `.chain/rules/` are served via the Chain MCP server. Select `@chain_rules` or `@chain_full_context` in your editor.

```markdown
<!-- .chain/rules/code-style.md -->
# Code Style

## Naming
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_SNAKE_CASE for constants

## Files
- One component per file
- Filename = component name (PascalCase)

## Error handling
- Always use try/catch for async operations
- Log errors with context (which function, which input)
```

### Skills (AI commands)

Files in `.chain/skills/` are served via the Chain MCP server. Select `@chain_skills` or `@chain_full_context` in your editor.

```markdown
<!-- .chain/skills/refactor.md -->
# Refactor

## Goal
Refactor code to a better structure without changing functionality.

## Process
1. Analyze the current code
2. Identify code smells
3. Apply refactoring patterns
4. Verify that tests still pass

## Checklist
- [ ] No new bugs introduced
- [ ] Tests still pass
- [ ] Code is more readable
```

### Workflows (dev processes)

Files in `.chain/workflows/` are served via the Chain MCP server. Select `@chain_workflows` or `@chain_full_context` in your editor.

```markdown
<!-- .chain/workflows/create-feature.md -->
# Create Feature

## Steps
1. Create a new branch
2. Write the feature spec
3. Implement the feature
4. Write tests
5. Create a PR
```

---

## Project Context (PROJECT.md)

During `init`, `.chain/PROJECT.md` is created. This file describes your project and is included in the `chain_full_context` prompt.

### Template sections

```markdown
# Project Context

## Overview
<!-- Describe what this project does -->

## Architecture
<!-- Describe the high-level architecture -->

## Tech Stack
<!-- Auto-filled from chain.yaml -->

## Directory Structure
<!-- Describe the key directories -->

## Conventions
<!-- Project-specific conventions -->

## Key Dependencies
<!-- Important dependencies and why they were chosen -->

## Development
<!-- How to run, build, and test -->

## Notes
<!-- Additional context for AI editors -->
```

### How it works

- The `Tech Stack` section is automatically populated from `tech_stack:` in `chain.yaml`
- PROJECT.md is included in `chain_full_context` when you select that prompt
- Fill in this file so the AI has immediate context about your project

---

## Editor Setup

### MCP-capable editors

Chain generates MCP configs for these editors. Content is served via prompts — select `@chain_full_context`, `@chain_rules`, `@chain_skills`, or `@chain_workflows` when needed.

| Editor | MCP config |
|--------|------------|
| **Cursor** | `.cursor/mcp.json` |
| **Claude Code** | `.claude/settings.json` |
| **Kiro** | `.kiro/settings/mcp.json` |
| **GitHub Copilot** | `.vscode/mcp.json` |
| **Roo** | `.roo/mcp.json` |
| **KiloCode** | `.kilocode/mcp.json` |
| **Amazon Q** | `.amazonq/default.json` |

### Dry-run (preview)

Preview which MCP configs would be generated:

```bash
bun chain sync --dry-run
```

### Validation

Check if your config and content are correct:

```bash
bun chain validate
```

---

## Using Templates

Templates save you time by providing default tech stack settings.

### Available templates

| Template | Language | Framework | Indent |
|---|---|---|---|
| `stacks/nextjs` | TypeScript | Next.js | 2 spaces |
| `stacks/react` | TypeScript | React | 2 spaces |
| `stacks/vue` | TypeScript | Vue | 2 spaces |
| `stacks/svelte` | TypeScript | SvelteKit | 2 spaces |
| `stacks/python-api` | Python | FastAPI | 4 spaces |
| `stacks/django` | Python | Django | 4 spaces |
| `stacks/rails` | Ruby | Rails | 2 spaces |
| `stacks/go-api` | Go | Gin | tabs |

### Usage

```yaml
# chain.yaml
extends:
  - stacks/nextjs

# Your own config overrides template values:
tech_stack:
  database: supabase  # Adds to the template
```

### Creating custom templates

Create a YAML file in `.chain/templates/`:

```yaml
# .chain/templates/my-stack.yaml
version: "1.0"
tech_stack:
  language: typescript
  framework: remix
  database: prisma
settings:
  indent_size: 2
  indent_style: space
```

Use it:
```yaml
extends:
  - my-stack
```

---

## Built-in skill & workflow templates

During `init`, built-in templates are automatically copied to `.chain/skills/` and `.chain/workflows/`. Existing files are never overwritten.

### Skills (5 templates)

| Template | Description |
|---|---|
| `code-review.md` | Structured code review with checklist |
| `debug-assistant.md` | Step-by-step debugging of issues |
| `finding-refactor-candidates.md` | Identify code that can be refactored |
| `refactor.md` | Perform refactoring without changing functionality |
| `verifying-responsiveness.md` | Verify responsive design |

### Workflows (3 templates)

| Template | Description |
|---|---|
| `create-prd.md` | Create a Product Requirements Document |
| `generate-tasks.md` | Generate tasks from a PRD |
| `refactor-prd.md` | PRD for a refactoring project |

You can customize or delete these templates. They serve as a starting point.

---

## Custom editors

Have an editor that's not built-in? Define it in YAML with `mcp_config_path`:

```yaml
custom_editors:
  - name: supermaven
    mcp_config_path: .supermaven/mcp.json

editors:
  supermaven: true  # Don't forget to enable it!
```

---

## Content Sources (shared rules across projects)

With `content_sources` you can share rules, skills, and workflows across multiple projects. Write them once, use them everywhere.

### Option A: Local path

Ideal when your projects are on the same machine (or in a monorepo):

```yaml
content_sources:
  - type: local
    path: ../shared-ai-rules        # relative path
  - type: local
    path: /Users/team/ai-standards  # absolute path
```

The resolver automatically looks for an `.chain/` or `templates/` directory in the given path. If neither exists, the path itself is used as the content root.

**Directory structure of the shared source:**
```
shared-ai-rules/
├── rules/
│   ├── code-style.md
│   └── security.md
├── skills/
│   └── refactor.md
└── workflows/
    └── deploy.md
```

### Option B: npm package

Ideal for teams that want to share rules via a private or public npm registry:

```yaml
content_sources:
  - type: package
    name: "@my-org/ai-rules"
```

Install the package first:
```bash
bun add -d @my-org/ai-rules
```

The resolver looks in the package for `.chain/`, `content/`, or uses the package root as a fallback.

### Filtering by category

By default, `rules`, `skills`, and `workflows` are all imported. You can filter:

```yaml
content_sources:
  - type: local
    path: ../shared-rules
    include: [rules]           # only rules, no skills/workflows
  - type: package
    name: "@my-org/ai-skills"
    include: [skills, workflows]
```

### Priority

**Local content always wins.** If your project has a `code-style.md` in `.chain/rules/` and the external source also has one, the local version is used. This way you can override shared rules per project.

### Keeping universal skills up to date

To use the same skills across multiple projects and keep them in sync:

#### 1. Create a shared hub

```bash
mkdir -p ~/.chain-hub/skills ~/.chain-hub/rules ~/.chain-hub/workflows
```

Or use `chain init --shared` to create `~/.chain/` as your hub.

#### 2. Add the hub to each project

In `chain.yaml` of every project:

```yaml
content_sources:
  - type: local
    path: ~/.chain-hub
```

During `chain init`, answer **Yes** to "Share your AI skills/rules across multiple projects?" and enter `~/.chain-hub`.

#### 3. Edit in one place

- Edit `~/.chain-hub/skills/css-tailwind.md` (or your hub path)
- All projects get the change immediately — the MCP server reads the hub live
- No sync needed for content changes

#### 4. Version control (for teams)

```bash
cd ~/.chain-hub
git init
git add .
git commit -m "Initial shared skills"
git remote add origin https://github.com/yourorg/chain-hub.git
git push
```

Team members: `git pull` in the hub to get updates. Changes are live in all projects.

#### Workflow summary

| Action | Where | Result |
|--------|-------|--------|
| Edit shared skill | `~/.chain-hub/skills/` | All projects see it immediately |
| Edit project-specific skill | `.chain/skills/` | Overrides hub for this project only |
| Add new shared skill | `~/.chain-hub/skills/` | Available in all projects |
| Update hub (team) | `git pull` in hub | Everyone gets latest |

See [CENTRAL_CONTENT_SETUP_GUIDE.md](./CENTRAL_CONTENT_SETUP_GUIDE.md) for more setup options (npm package, monorepo, etc.).

---

## MCP servers

Chain is MCP-only: content is served via the Chain MCP server. `chain sync` generates MCP configs for enabled editors.

### What does sync change?

`chain sync` updates these files in your project:

| File | What happens |
|------|--------------|
| `.cursor/mcp.json`, `.claude/settings.json`, etc. | MCP server configs (when `mcp_servers` is in chain.yaml) |
| `.gitignore` | Adds a managed block with paths to ignore (MCP config paths) |
| `.editorconfig`, `.vscode/settings.json` | Editor settings (when `settings:` is in chain.yaml) |

Use `chain sync --verbose` to see exactly which paths were updated.

| Editor | MCP config location |
|--------|---------------------|
| Cursor | `.cursor/mcp.json` |
| Claude Code | `.claude/settings.json` |
| Kiro | `.kiro/settings/mcp.json` |
| GitHub Copilot | `.vscode/mcp.json` |
| Roo | `.roo/mcp.json` |
| KiloCode | `.kilocode/mcp.json` |
| Amazon Q | `.amazonq/default.json` |

### Configuration

The Chain MCP server is added by `chain init`. Add other servers in `chain.yaml`:

```yaml
mcp_servers:
  - name: chain
    command: npx
    args: ["-y", "@silverfox14/chain", "mcp-server"]
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
  - name: postgres
    command: npx
    args: ["-y", "@modelcontextprotocol/server-postgres"]
    env:
      DATABASE_URL: "postgresql://localhost:5432/mydb"
```

---

## Editor settings

The `settings:` section automatically generates `.editorconfig` and `.vscode/settings.json`:

```yaml
settings:
  indent_size: 2
  indent_style: space
  format_on_save: true
```

Generates:

**`.editorconfig`:**
```ini
# Generated by chain
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

**`.vscode/settings.json`:**
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true
}
```

---

## Monorepo Setup

For monorepos with multiple projects:

```
my-monorepo/
├── chain.yaml                # Root config
├── .chain/
├── packages/
│   ├── frontend/
│   │   ├── chain.yaml         # Frontend-specific config
│   │   └── .chain/
│   └── backend/
│       ├── chain.yaml         # Backend-specific config
│       └── .chain/
```

Sync everything at once:

```bash
bun chain sync-all
```

This automatically finds all `chain.yaml` files up to 3 levels deep.

---

## CI/CD Integration

### npm scripts (automatically added by `init`)

`chain init` automatically adds the following scripts to your `package.json`:

```json
{
  "scripts": {
    "sync": "chain sync",
    "sync:dry": "chain sync --dry-run",
    "sync:watch": "chain watch"
  }
}
```

You can of course add extra scripts:

```json
{
  "scripts": {
    "ai:validate": "chain validate",
    "precommit": "chain sync"
  }
}
```

### GitHub Actions

```yaml
name: Chain Sync Check
on:
  pull_request:
    paths: ['.chain/**', 'chain.yaml']
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun chain sync
      - name: Check for uncommitted changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "::error::Chain config is out of sync!"
            echo "Run 'bun chain sync' and commit the changes."
            exit 1
          fi
```

### Pre-commit hook (automatic)

`chain init` automatically installs a `.git/hooks/pre-commit` hook that on every commit:
1. Runs `chain sync`
2. Adds generated MCP configs to the commit (`git add`)

If a pre-commit hook already exists, the chain hook is appended to it (not overwritten).

### Husky pre-commit hook (alternative)

If you use Husky, you can use this instead:

```bash
# .husky/pre-commit
bun chain sync
git add .cursor/ .claude/ .kiro/ .vscode/ .roo/ .kilocode/ .amazonq/
```

---

## Command Reference

| Command | Description |
|---|---|
| `chain init` | Initialize project (auto-detect tech stack, quick setup) |
| `chain init --advanced` | Full setup wizard with content sources and detailed tech stack |
| `chain init --force` | Reinitialize (overwrites existing config) |
| `chain sync` | Generate MCP configs for enabled editors |
| `chain sync --dry-run` | Preview which MCP configs would be generated |
| `chain sync --verbose` | Show exact paths that were updated |
| `chain validate` | Validate config and MCP server |
| `chain watch` | Regenerate MCP configs on file changes |
| `chain sync-all` | Sync all projects in a monorepo |
| `chain sync-all --dry-run` | Preview monorepo sync |
| `chain generate-context` | Analyze project and generate rich PROJECT.md |
| `chain clean` | Remove generated MCP configs and editor directories |
| `chain menu` | Interactive menu for common chain operations |
| `chain full-menu` | Complete interactive menu with all scripts and navigation |

---

## Frequently Asked Questions

### Should I commit the generated files?

**Yes.** Commit both `.chain/` (your content) and the generated MCP configs (`.cursor/mcp.json`, etc.). The pre-commit hook keeps them in sync.

### How do I add a new rule?

1. Create a `.md` file in `.chain/rules/`
2. The MCP server reads it live — no sync needed for content
3. Run `chain sync` only if you added a new editor or changed `chain.yaml`

### How does template inheritance work?

Templates are merged with your project config. Your project config always wins:

```
Template: tech_stack.language = "typescript"
Project:  tech_stack.database = "supabase"
Result:   language = "typescript", database = "supabase"
```

### Can I combine multiple templates?

Yes:
```yaml
extends:
  - stacks/nextjs
  - my-custom-template
```

Templates are merged in order, later overrides earlier.
