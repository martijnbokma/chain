# Chain

**Break the silos. Forge the connection. Transform your AI development workflow.**

> **One chain to rule them all.** Connect your rules, skills, and workflows to MCP-capable AI editors via a single, unbreakable link.

## The Chain Revolution

In the fragmented world of AI development, every editor speaks its own language. Rules get duplicated. Skills go missing. **Chain** is the missing link — an MCP server that serves your `chain-hub/` content live to every connected editor.

**Chain transforms chaos into harmony** — one source of truth (`chain-hub/`) served via the Model Context Protocol. No file sync, no duplication. Select prompts when you need them.

## Why Chain Changes Everything

### 🚀 **MCP-Only — One Simple Way**
Content stays in `chain-hub/`. The Chain MCP server reads it live. No copying to editor-specific directories. Select `@chain_full_context` or `@chain_rules` when you need them.

### ⚡ **No Sync Needed**
Edit `chain-hub/` and the MCP server serves the latest content immediately. Run `chain sync` only to regenerate MCP configs when you add editors or change settings.

### 🔗 **Forged in Steel**
Built with TypeScript precision and tested across 380+ test cases, Chain is the unbreakable backbone your AI development workflow deserves.

## The Chain Experience

- **🔌 MCP-First** — Chain MCP server exposes rules, skills, and workflows as prompts (chain_full_context, chain_rules, chain_skills, chain_workflows)
- **🌐 MCP-Capable Editors** — Cursor, Claude Code, Kiro, GitHub Copilot, Roo, KiloCode, Amazon Q
- **⚙️ Single Source of Truth** — Your `chain-hub/` directory is the master; the MCP server reads it live
- **🎯 Intelligent Context** — PROJECT.md enriches prompts with deep project understanding
- **🧠 Tech Stack Telepathy** — Automatically detects your language, framework, runtime, and database
- **📚 Template Treasury** — 8 battle-tested stack templates ready to deploy
- **🎨 Skill Arsenal** — 7+ core skills, 14 specialist roles, 4 workflow templates
- **🌲 Cross-Project Forest** — Share content via `content_sources` across multiple projects
- **🛠️ Smart Settings** — Auto-generates `.editorconfig` and `.vscode/settings.json`
- **✅ Guardian Validation** — Pre-flight checks ensure your chain remains unbroken
- **🏗️ Monorepo Mastery** — Conquer entire code forests with `sync-all`

## Installation

### 🚀 npm Package (Recommended)

```bash
# Install with npm
npm install @silverfox14/chain
npx @silverfox14/chain init
npx @silverfox14/chain sync

# Install with Bun (faster)
bun add @silverfox14/chain
bunx @silverfox14/chain init
bunx @silverfox14/chain sync

# Install with pnpm
pnpm add @silverfox14/chain
pnpm dlx @silverfox14/chain init
pnpm dlx @silverfox14/chain sync
```

### 📦 Alternative Installation Methods

```bash
# Method 1: Global installation
npm install -g @silverfox14/chain
# or
bun add -g @silverfox14/chain

# Use from anywhere
chain init
chain sync

# Method 2: Direct usage (no install)
npx @silverfox14/chain init
bunx @silverfox14/chain init
```

### 🔧 Development Setup

```bash
# For developers wanting to contribute
git clone https://github.com/martijnbokma/chain.git
cd chain
bun install
bun run build
bun run test:run  # Verify everything works
```

## Quick Start: 3 Simple Steps

### **Step 1: Install Chain**
```bash
npm install @silverfox14/chain
# or
bun add @silverfox14/chain
```

### **Step 2: Configure & Initialize**
```bash
npx @silverfox14/chain init
# or
bunx @silverfox14/chain init
```

The wizard will ask you:
- ✅ Which MCP-capable editors you use (Cursor, Claude, Kiro, etc.)
- ✅ Your tech stack (React, Node.js, Python, etc.)
- 🔄 Share skills across multiple projects? (Creates shared content hub)

The Chain MCP server is added to `chain.yaml` automatically.

### **Step 3: Sync MCP Configs**
```bash
npx @silverfox14/chain sync
# or  
bunx @silverfox14/chain sync
```

This generates `.cursor/mcp.json`, `.claude/settings.json`, etc. with the Chain MCP server.

### **Step 4: Use Prompts in Your Editor**
Open your project in Cursor, Claude Code, or another MCP-capable editor. Select `@chain_full_context`, `@chain_rules`, `@chain_skills`, or `@chain_workflows` when you need them.

**🎉 That's it! Content is served live from `chain-hub/` — no file sync needed.**

> **Migrating from file sync?** See [docs/MIGRATION-MCP-ONLY.md](docs/MIGRATION-MCP-ONLY.md).

---

## 🚀 Using Chain in Your Project

**After installing `@silverfox14/chain`, you have several ways to use it:**

### **🎯 Method 1: Direct Usage (Easiest - No Setup Needed)**
```bash
# Install and use immediately
npm install @silverfox14/chain
npx @silverfox14/chain menu
npx @silverfox14/chain sync
npx @silverfox14/chain watch
```

### **⚡ Method 2: Add Scripts (Recommended for Daily Use)**

**Add these scripts to your project's `package.json`:**

```json
{
  "scripts": {
    "chain:menu": "@silverfox14/chain menu",
    "chain:sync": "@silverfox14/chain sync", 
    "chain:watch": "@silverfox14/chain watch",
    "chain:validate": "@silverfox14/chain validate",
    "chain:validate": "@silverfox14/chain validate"
  }
}
```

**Now you can simply run:**
```bash
npm run chain:menu      # Open interactive menu
npm run chain:sync      # Generate MCP configs
npm run chain:watch     # Regenerate configs on changes
```

### **🌍 Method 3: Global Installation (Use Anywhere)**
```bash
npm install -g @silverfox14/chain
# Then use from any directory:
chain menu
chain sync
chain watch
```

---

## 💡 Quick Start Summary

**For beginners - just run these 3 commands:**
```bash
# 1. Install
npm install @silverfox14/chain

# 2. Initialize (choose shared content for multi-project sync)
npx @silverfox14/chain init

# 3. Open menu
npx @silverfox14/chain menu
```

**For multi-project workflows:**
```bash
# During init, choose "Yes" for sharing across projects
# Your shared hub will be created at ~/chain-hub
# All projects will automatically use the same skills/rules
```

**Pro tip:** Add this alias to your shell for easier usage:
```bash
echo 'alias chain="npx @silverfox14/chain"' >> ~/.zshrc
source ~/.zshrc
```

That's it. The wizard forges your initial chain with minimal questions, auto-detecting your tech stack and establishing connections to your chosen editors.

## 🔄 Share Your Chain Across Projects

**Want to use the same AI rules, skills, and workflows across multiple projects?** Chain makes it easy:

### **Quickest Setup - Shared Local Hub**
```bash
# 1. Create your shared content hub (one-time setup)
mkdir ~/chain-hub
cd ~/chain-hub
npx @silverfox14/chain init
# Add your custom skills, rules, workflows here

# 2. Use in any project
cd your-project
echo "content_sources:
  - type: local
    path: ~/chain-hub" > chain.yaml
npx @silverfox14/chain sync
```

### **Team Collaboration - Git Repository**
```bash
# 1. Create shared repo
git clone https://github.com/yourteam/ai-rules.git ~/ai-rules
cd ~/ai-rules
npx @silverfox14/chain init

# 2. Use in projects
content_sources:
  - type: local
    path: ~/ai-rules
```

**📖 See [Cross-Project Setup](#cross-project-chain-network) below for advanced options.**

For teams building interconnected project ecosystems:

```bash
npx @silverfox14/chain init --advanced
```

## Your Chain Architecture

After initiation, your project has:

```
your-project/
├── chain.yaml                   # Config — editors, mcp_servers, metadata
├── chain-hub/                   # Your source of truth (MCP server reads this live)
│   ├── PROJECT.md               # Project context → included in chain_full_context
│   ├── rules/                   # Development rules
│   │   └── project-conventions.md
│   ├── skills/                  # AI skills
│   │   ├── code-review.md
│   │   ├── debug-assistant.md
│   │   └── ...
│   └── workflows/               # Dev workflows
│       ├── create-prd.md
│       └── ...

# ↓ Generated by `chain sync` ↓
├── .cursor/mcp.json             # Cursor MCP config (Chain server)
├── .claude/settings.json        # Claude MCP config
├── .kiro/settings/mcp.json      # Kiro MCP config
└── ...
```

Content is **not** copied to editor directories. The Chain MCP server reads `chain-hub/` live and exposes prompts.

## Configuration: Forge Your Master Key

`chain.yaml` - The heart of your chain:

```yaml
version: "1.0"

extends:
  - stacks/nextjs                # Inherit battle-tested templates

editors:
  cursor: true
  windsurf: true
  claude: true
  kiro: false
  trae: false
  gemini: false
  copilot: false

metadata:
  name: "My Project"
  description: "A revolutionary web application"

tech_stack:
  language: typescript
  framework: nextjs
  database: supabase

mcp_servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"]

settings:
  indent_size: 2
  indent_style: space
  format_on_save: true

# Share your chain across projects (optional)
content_sources:
  - type: local
    path: ../shared-ai-rules
  - type: package
    name: "@my-org/ai-rules"

# Plugin system for any editor (optional)
custom_editors:
  - name: supermaven
    rules_dir: .supermaven/rules
    skills_dir: .supermaven/skills
    entry_point: SUPERMAVEN.md
```

## MCP-Capable Editors

Chain generates MCP configs for these editors (content served via prompts):

| Editor | MCP Config |
|--------|------------|
| **Cursor** | `.cursor/mcp.json` |
| **Claude Code** | `.claude/settings.json` |
| **Kiro** | `.kiro/settings/mcp.json` |
| **GitHub Copilot** | `.vscode/mcp.json` |
| **Roo** | `.roo/mcp.json` |
| **KiloCode** | `.kilocode/mcp.json` |
| **Amazon Q** | `.amazonq/default.json` |

## Template Treasury: Ready-to-Forge Templates

### Stack Templates - Battle-Tested Foundations

Inherit proven configurations to jumpstart your chain:

```yaml
extends:
  - stacks/nextjs
```

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

### Skill Arsenal - AI Capabilities Ready to Deploy

Automatically copied to `chain-hub/skills/` during initiation:

| Skill | Description |
|---|---|
| `code-review.md` | Systematic code review with comprehensive checklist |
| `debug-assistant.md` | Step-by-step debugging methodology |
| `finding-refactor-candidates.md` | Identify code ripe for refactoring |
| `refactor.md` | Transform code without breaking functionality |
| `verifying-responsiveness.md` | Ensure responsive design excellence |
| `framework-discovery.md` | Uncover framework patterns and conventions |
| `incremental-development.md` | Build features through iterative development |

### Specialist Roles - Expert AI Personalities

14 role-based specialist skills in `skills/specialists/`:

`accessibility-specialist` · `api-designer` · `backend-developer` · `database-specialist` · `devops-engineer` · `frontend-developer` · `fullstack-developer` · `performance-specialist` · `qa-tester` · `security-specialist` · `technical-writer` · `typescript-specialist` · `ui-designer` · `ux-designer`

### Workflow Templates - Development Process Blueprints

Copied to `chain-hub/workflows/` during initiation:

| Workflow | Description |
|---|---|
| `create-prd.md` | Forge comprehensive Product Requirements Documents |
| `generate-tasks.md` | Transform PRDs into actionable task lists |
| `implementation-loop.md` | Master iterative development cycles |
| `refactor-prd.md` | Strategic PRDs for refactoring missions |

## Cross-Project Chain Network

Share your forged chain across multiple projects, creating an interconnected development ecosystem:

### 🎯 Choose Your Content Hub Strategy

Pick the approach that fits your workflow:

| Approach | Best For | Setup |
|---|---|---|
| **Local Folder** | Solo developers, small teams | `chain init --shared` |
| **Git Repository** | Teams wanting version control | `git init ai-content-hub` |
| **npm Package** | Organizations, multi-team | `npm init @myorg/ai-rules` |

📖 **See the complete [Central Content Setup Guide](docs/CENTRAL_CONTENT_SETUP_GUIDE.md)** for detailed instructions.

### Quick Examples

**Local Folder (Easiest):**
```yaml
content_sources:
  - type: local
    path: ~/.chain
    include: [rules, skills, workflows]
```

**Git Repository (Team Collaboration):**
```yaml
content_sources:
  - type: local
    path: ../ai-content-hub
```

**npm Package (Enterprise):**
```yaml
content_sources:
  - type: package
    name: "@myorg/ai-rules"
```

**Hybrid (Best of All Worlds):**
```yaml
content_sources:
  - type: package
    name: "@myorg/ai-rules"        # Base content
  - type: local
    path: ../team-workflows        # Team-specific
  - type: local
    path: ./my-personal-rules     # Personal overrides
```

**Local content always takes priority** over shared content. The MCP server merges content from `content_sources` with your local `chain-hub/`.

## Chain Commands: Master Your Connections

| Command | Description |
|---|---|
| `npx @silverfox14/chain init` | Forge your initial chain (auto-detects tech stack, quick setup) |
| `npx @silverfox14/chain init --advanced` | Master forge wizard with content sources and detailed tech stack |
| `npx @silverfox14/chain init --force` | Re-forge (overwrites existing chain) |
| `npx @silverfox14/chain init --shared` | Create shared content hub for cross-project sync |
| `npx @silverfox14/chain sync` | Generate MCP configs for enabled editors |
| `npx @silverfox14/chain sync --dry-run` | Preview which MCP configs would be generated |
| `npx @silverfox14/chain validate` | Verify config and MCP server |
| `npx @silverfox14/chain watch` | Regenerate MCP configs on file changes |
| `npx @silverfox14/chain sync-all` | Sync all projects in a monorepo |
| `npx @silverfox14/chain sync-all --dry-run` | Preview monorepo sync |

## CI/CD Integration: Automated Chain Strength

### npm scripts (auto-forged by `init`)

```json
{
  "scripts": {
    "chain:init": "@silverfox14/chain init",
    "chain:sync": "@silverfox14/chain sync",
    "chain:dry": "@silverfox14/chain sync --dry-run",
    "chain:watch": "@silverfox14/chain watch"
  }
}
```

### GitHub Actions - Chain Integrity Guardian

```yaml
name: Chain Integrity Check
on:
  pull_request:
    paths: ['chain-hub/**', 'chain.yaml']
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: npm install @silverfox14/chain
      - run: npx @silverfox14/chain sync
      - name: Verify chain integrity
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "::error::Chain is out of sync!"
            echo "Run 'npx @silverfox14/chain sync' and commit the changes."
            exit 1
          fi
```

## Development: Forge Chain Contributions

```bash
bun install          # Install dependencies
bun run typecheck    # TypeScript precision check
bun run test:run     # Run comprehensive test suite
bun run test:coverage # Generate coverage reports
bun run build        # Forge for npm distribution
```

### Testing: Unbreakable Chain Quality

Chain uses Vitest for ironclad testing with comprehensive coverage:

- `bun run test` - Watch mode for continuous forging
- `bun run test:run` - Complete test execution  
- `bun run test:coverage` - Generate detailed coverage reports in `coverage/`

See [CONTRIBUTING.md](CONTRIBUTING.md#testing) for detailed forging instructions and quality standards.

## Documentation: Master the Chain

- [docs/GUIDE.md](docs/GUIDE.md) — Complete chain mastery guide covering all features in exhaustive detail
- [docs/PUBLISHING.md](docs/PUBLISHING.md) — How to publish Chain to the npm registry
- [docs/NPM-REGISTRY-PUBLISHING.md](docs/NPM-REGISTRY-PUBLISHING.md) — How to publish Chain to your own npm registry (GitHub Packages, Verdaccio, etc.)

## Contributing: Strengthen the Chain

Want to help forge a stronger Chain? See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, architecture insights, and contribution guidelines.

## License

MIT - Forge freely, share widely.

---

**Chain: Where fragmented AI development becomes unified power.**

*Break the silos. Forge the connection. Transform your workflow.*
