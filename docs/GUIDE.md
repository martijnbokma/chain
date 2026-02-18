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
10. [Multi-Project Workflow (DRY)](#multi-project-workflow-dry)
11. [Content Sources (shared rules)](#content-sources-shared-rules-across-projects)
12. [SSOT Synchronization](#ssot-synchronization)
13. [Promote Command](#promote-command)
14. [MCP Servers](#mcp-servers)
15. [Editor Settings](#editor-settings)
16. [Monorepo Setup](#monorepo-setup)
17. [CI/CD Integration](#cicd-integration)
18. [Command Reference](#command-reference)

---

## Installation

### Option 1: Run directly (recommended — no install needed)

```bash
bunx chain init
bunx chain sync

# Or with npx
npx chain init
```

### Option 2: As devDependency (for teams)

```bash
bun add -d chain

# Or with npm/pnpm
npm install -D chain
pnpm add -D chain
```

### Option 3: Install globally

```bash
bun add -g chain
```

### Option 4: Link locally (for development)

If the package is not yet on npm, or you want to test a local version:

```bash
# In the chain repo:
cd /path/to/chain
bun link

# In your project:
cd /path/to/my-project
bun link chain
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
- `.chain/PROJECT.md` — project context (included in all entry points)
- `.chain/rules/` — project rules (shared with all editors)
- `.chain/skills/` — AI skills/commands
- `.chain/workflows/` — development workflows
- `.chain/overrides/` — editor-specific overrides

Plus example files:
- `.chain/rules/project-conventions.md`
- `.chain/skills/code-review.md`, `debug-assistant.md`, `finding-refactor-candidates.md`, `refactor.md`, `verifying-responsiveness.md`
- `.chain/workflows/create-prd.md`, `generate-tasks.md`, `refactor-prd.md`

Automatic DX setup (when possible):
- **package.json** — adds `sync`, `sync:dry`, and `sync:watch` scripts
- **.git/hooks/pre-commit** — installs auto-sync hook (if `.git/` exists)

### Step 2: Configure your editors

Open `chain.yaml` and enable the editors you use:

```yaml
version: "1.0"

editors:
  cursor: true
  windsurf: true
  claude: true
  # Set to true for the ones you use:
  kiro: false
  trae: false
  gemini: false
  copilot: false

metadata:
  name: "My Project"
  description: "Short description of your project"

tech_stack:
  language: typescript
  framework: nextjs
  database: supabase
```

### Step 3: Sync to all editors

```bash
bunx chain sync
```

Output:
```
✔ Configuration loaded

Syncing to 3 editor(s): cursor, windsurf, claude
ℹ Found 1 rule(s)
  ✓ .chain/rules/project-conventions.md → .cursor/rules/project-conventions.md
  ✓ .chain/rules/project-conventions.md → .windsurf/rules/project-conventions.md
  ✓ .chain/rules/project-conventions.md → .claude/rules/project-conventions.md
ℹ Found 1 skill(s)
  ✓ .chain/skills/code-review.md → .cursor/commands/code-review.md
  ✓ .chain/skills/code-review.md → .windsurf/workflows/code-review.md
  ✓ .chain/skills/code-review.md → .claude/skills/code-review.md
  ✓ generated → .cursorrules
  ✓ generated → .windsurfrules
  ✓ generated → CLAUDE.md

Sync Summary
✓ Synced: 9 file(s)
✓ Sync complete!
```

That's it! Your AI editors now automatically read the generated files.

---

## Configuration

### Full `chain.yaml` reference

```yaml
version: "1.0"

# Template inheritance (optional)
extends:
  - stacks/nextjs

# Which editors are active (boolean or object syntax)
editors:
  cursor: true
  windsurf: true
  claude: true
  kiro: false
  trae: false
  gemini: false
  copilot: false
  codex: false
  aider: false
  roo: false
  kilocode: false
  antigravity: false
  bolt: false
  warp: false
  replit: false
  cline: false
  amazonq: false
  junie: false
  augment: false
  zed: false
  continue: false
  # Object syntax (optional):
  # cursor:
  #   enabled: true
  #   output_path: custom/path

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

# Custom editors (plugin system)
custom_editors:
  - name: my-editor
    rules_dir: .my-editor/rules
    skills_dir: .my-editor/skills
    entry_point: MY_EDITOR.md
```

---

## Writing Content

### Rules (project rules)

Files in `.chain/rules/` are synced to **all** enabled editors.

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

Files in `.chain/skills/` are synced to editors as reusable commands.

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

Files in `.chain/workflows/` are only synced to editors that support workflows (Windsurf, Kiro).

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

### Overrides (editor-specific)

Files in `.chain/overrides/{editor-name}/` override or add content to a specific editor.

```
.chain/overrides/
├── cursor/
│   └── cursor-specific-rule.md    → only to .cursor/rules/
├── claude/
│   └── claude-permissions.md      → only to .claude/rules/
└── windsurf/
    └── windsurf-workflow.md       → only to .windsurf/rules/
```

---

## Project Context (PROJECT.md)

During `init`, `.chain/PROJECT.md` is created. This file describes your project and is automatically included in **all entry points** (`.cursorrules`, `.windsurfrules`, `CLAUDE.md`, `AGENTS.md`, etc.).

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
- During `sync`, the contents of PROJECT.md are appended after the generated entry point header, separated by `---`
- PROJECT.md is **only** included if you have actually filled in content (HTML comments are ignored during the check)
- Fill in this file so every AI editor has immediate context about your project

---

## Editor Setup

### How it works per editor

| Editor | Entry point | Rules dir | Skills/Commands dir | MCP config |
|---|---|---|---|---|
| **Cursor** | `.cursorrules` | `.cursor/rules/` | `.cursor/commands/` | `.cursor/mcp.json` |
| **Windsurf** | `.windsurfrules` | `.windsurf/rules/` | `.windsurf/workflows/` | — |
| **Claude** | `CLAUDE.md` | `.claude/rules/` | `.claude/skills/` | `.claude/settings.json` |
| **Kiro** | — | `.kiro/steering/` | `.kiro/specs/workflows/` | `.kiro/settings/mcp.json` |
| **Trae** | — | `.trae/rules/` | `.trae/skills/` | — |
| **Gemini** | — | `.gemini/rules/` | `.gemini/skills/` | — |
| **Copilot** | `.github/copilot-instructions.md` | `.github/instructions/` | `.github/instructions/` | `.vscode/mcp.json` |
| **Codex** | `AGENTS.md` | `.codex/` | `.codex/skills/` | — |
| **Aider** | `AGENTS.md` | `.aider/` | — | — |
| **Roo** | — | `.roo/rules/` | `.roo/skills/` | `.roo/mcp.json` |
| **KiloCode** | — | `.kilocode/rules/` | `.kilocode/skills/` | `.kilocode/mcp.json` |
| **Antigravity** | — | `.agent/rules/` | `.agent/skills/` | — |
| **Bolt** | `.bolt/prompt` | `.bolt/` | — | — |
| **Warp** | `WARP.md` | `.warp/rules/` | — | — |

### Dry-run (preview)

Want to see what would happen first?

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

Have an editor that's not built-in? Define it in YAML:

```yaml
custom_editors:
  - name: supermaven
    rules_dir: .supermaven/rules
    skills_dir: .supermaven/skills
    workflows_dir: .supermaven/workflows  # optional
    entry_point: SUPERMAVEN.md
    mcp_config_path: .supermaven/mcp.json
    file_naming: flat  # or 'subdirectory'

editors:
  supermaven: true  # Don't forget to enable it!
```

---

## Multi-Project Workflow (DRY)

chain is designed to keep rules, skills, and workflows in sync across all your projects — write once, use everywhere.

### How it works

```
~/projects/
├── chain/                       ← Shared SSOT (single source of truth)
│   └── templates/
│       ├── rules/               ← Shared rules
│       ├── skills/              ← Shared skills
│       └── workflows/           ← Shared workflows
│
├── project-1/                   ← content_sources: ../chain
│   ├── chain.yaml
│   └── .chain/             ← Local + shared content merged
│
├── project-2/                   ← content_sources: ../chain
│   ├── chain.yaml
│   └── .chain/             ← Local + shared content merged
│
└── project-3/                   ← content_sources: ../chain
    ├── chain.yaml
    └── .chain/
```

### Setup

1. **Create a shared folder** with your team-wide or personal rules:

```bash
mkdir -p ~/projects/chain/templates/{rules,skills,workflows}
```

2. **Initialize each project** — the wizard auto-detects nearby shared folders:

```bash
cd ~/projects/project-1
chain init
# → "Found shared content source at ../chain. Link it?" → Yes
```

Or add it manually to `chain.yaml`:

```yaml
content_sources:
  - type: local
    path: ../chain
```

3. **Sync** — shared content is merged with local content:

```bash
chain sync
```

### Automatic cross-project sync

When you run `watch` mode, chain monitors **both** your local `.chain/` and the shared SSOT folder:

```bash
chain watch
# Watching: chain.yaml, .chain/, ../chain (SSOT)
```

This means:
- **Change a skill in project-1** → auto-promoted to SSOT → project-2's watcher picks it up → auto-synced
- **Add a rule to the shared folder** → all projects with `watch` running get it immediately
- **No manual action needed** — every project stays in sync automatically

### What happens during sync

| Action | Result |
|---|---|
| New local file not in SSOT | Auto-promoted to SSOT |
| SSOT has file not in local | Pulled into local `.chain/` |
| Local file differs from SSOT | Interactive prompt: update SSOT or local? |
| Local file removed | Prompt: remove from SSOT too? |

### Per-project overrides

Shared content is the baseline. Each project can override or extend it:

```
project-1/.chain/
├── rules/
│   └── project-specific-rule.md   ← Only in this project
├── skills/
│   └── code-review.md             ← Overrides the shared version
└── overrides/
    └── cursor/
        └── cursor-only.md         ← Only for Cursor in this project
```

**Local content always wins.** If a file exists both locally and in the SSOT, the local version is used.

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

---

## SSOT Synchronization

When you use `content_sources`, Chain keeps your local content and the shared SSOT (Single Source of Truth) automatically in sync.

### Watch mode (automatic cross-project sync)

Run `chain watch` in each project. The watcher monitors both your local `.chain/` and the shared SSOT folder. When any file changes in the SSOT (e.g. because another project promoted a new skill), the watcher automatically re-syncs.

```bash
# In project-1 terminal:
chain watch

# In project-2 terminal:
chain watch

# Now: change a skill in project-1 → auto-promoted to SSOT → project-2 picks it up
```

### Auto-promote

During every `sync`, **new** local files are automatically promoted to the SSOT. If you create a new file in `.chain/skills/` and it doesn't exist in the SSOT yet, it is automatically copied there.

### Diff detection

After the sync, chain checks whether local files differ from the SSOT version. If there are differences, you get an interactive prompt:

```
⚠ skills/code-review.md — local is newer. Update SSOT? (y/n)
⚠ rules/security.md — SSOT is newer. Update local? (y/n)
```

The direction is determined based on the file modification date (mtime).

### Orphan detection

If a file exists in the SSOT but has been removed locally, this is reported:

```
⚠ skills/old-skill.md — remove from SSOT? (y/n)
```

### Cleanup of orphaned files

During every sync, **orphaned auto-generated files** are automatically removed from editor directories. Only files with the `AUTO-GENERATED` marker that are no longer part of the current sync are cleaned up. Manually created files are never removed.

---

## Promote Command

With `promote` you can manually copy a local file to the shared SSOT:

```bash
# Promote a skill
bun chain promote skills/my-new-skill.md

# Promote a rule
bun chain promote rules/my-rule.md

# Overwrite if it already exists
bun chain promote skills/my-skill.md --force
```

### Requirements

- A `content_sources` entry of type `local` must be configured in `chain.yaml`
- The path must start with `skills/`, `workflows/`, or `rules/`
- You can also provide the full path: `.chain/skills/my-skill.md`

### Where does it go?

The file is copied to `<content_source_path>/templates/<category>/<filename>`.

---

## MCP servers

MCP (Model Context Protocol) servers are automatically distributed to editors that support them:

| Editor | MCP config location |
|---|---|
| Cursor | `.cursor/mcp.json` |
| Claude | `.claude/settings.json` |
| Kiro | `.kiro/settings/mcp.json` |
| Copilot | `.vscode/mcp.json` |
| Roo | `.roo/mcp.json` |
| KiloCode | `.kilocode/mcp.json` |

### Configuration

```yaml
mcp_servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    enabled: true

  - name: postgres
    command: npx
    args: ["-y", "@modelcontextprotocol/server-postgres"]
    env:
      DATABASE_URL: "postgresql://localhost:5432/mydb"
    enabled: true
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
2. Adds all generated files to the commit (`git add`)

If a pre-commit hook already exists, the chain hook is appended to it (not overwritten).

### Husky pre-commit hook (alternative)

If you use Husky, you can use this instead:

```bash
# .husky/pre-commit
bun chain sync
git add .cursorrules .windsurfrules CLAUDE.md AGENTS.md WARP.md .cursor/ .windsurf/ .claude/ .kiro/ .trae/ .gemini/ .github/ .codex/ .aider/ .roo/ .kilocode/ .agent/ .bolt/ .warp/
```

---

## Command Reference

| Command | Description |
|---|---|
| `chain init` | Initialize project (auto-detect tech stack, quick setup) |
| `chain init --advanced` | Full setup wizard with content sources and detailed tech stack |
| `chain init --force` | Reinitialize (overwrites existing config) |
| `chain sync` | Sync content to all enabled editors |
| `chain sync --dry-run` | Preview what would change |
| `chain validate` | Validate config and content |
| `chain watch` | Auto-sync on file changes |
| `chain sync-all` | Sync all projects in a monorepo |
| `chain sync-all --dry-run` | Preview monorepo sync |
| `chain promote <file>` | Promote a local file to the shared SSOT |
| `chain promote <file> --force` | Promote and overwrite existing |
| `chain generate-context` | Analyze project and generate rich PROJECT.md |
| `chain clean` | Remove all generated content (editor configs, .chain, etc.) |
| `chain sync-templates` | Two-way sync between templates and .chain |
| `chain sync-templates-to-ai-content` | Sync templates → .chain |
| `chain sync-ai-content-to-templates` | Sync .chain → templates |
| `chain sync-status` | Show sync status between templates and .chain |
| `chain conflict-resolution` | Analyze and resolve file conflicts based on timestamps |
| `chain templates-sync` | Sync templates/ with .chain/ (newest file wins) |
| `chain validate-prompts` | Validate prompt quality according to standards |
| `chain smart-sync` | Smart sync using content hashing instead of timestamps |
| `chain resolve-conflicts` | AI-powered conflict resolution for sync conflicts |
| `chain registry` | Global content registry management |
| `chain performance` | Performance monitoring and optimization |
| `chain realtime-sync` | Real-time sync with file watching |
| `chain improve-prompts` | Automatically improve prompts by adding missing sections |
| `chain menu` | Interactive menu for common chain operations |
| `chain full-menu` | Complete interactive menu with all scripts and navigation |
| `chain ai` | Advanced AI integration for content analysis and enhancement |

---

## Frequently Asked Questions

### Should I commit the generated files?

**That depends on your setup.** Chain supports both workflows:

- **With pre-commit hook (default):** The automatically installed hook runs `sync` and adds generated files to the commit. This way they are always up-to-date in your repo.
- **With .gitignore:** Chain adds generated paths to a managed block in `.gitignore`. If you don't use the pre-commit hook, the files are ignored.

The source of truth is always `.chain/` — you commit that regardless.

### Can I manually edit files in `.cursor/rules/`?

**Don't.** Files with the `AUTO-GENERATED` marker are overwritten on the next sync. Use `.chain/overrides/cursor/` for editor-specific content instead.

### How do I add a new rule?

1. Create a `.md` file in `.chain/rules/`
2. Run `bun chain sync`
3. Done — the file is now available in all editors

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
