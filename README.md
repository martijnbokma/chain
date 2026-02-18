# Chain

**Break the silos. Forge the connection. Transform your AI development workflow.**

> **One chain to rule them all.** Connect your rules, skills, and workflows across **20+ AI editors** with a single, unbreakable link.

## The Chain Revolution

In the fragmented world of AI development, every editor speaks its own language. Rules get duplicated. Skills go missing. Workflows break. **Chain** is the missing link that creates a seamless connection across your entire AI ecosystem.

**Chain transforms chaos into harmony** — one source of truth that flows through every editor like a perfectly forged chain, ensuring consistency, eliminating duplication, and amplifying your development power.

## Why Chain Changes Everything

### 🚀 **Unbreakable Connection**
Create a single, powerful link between your development standards and every AI editor. No more scattered rules, no more version conflicts — just pure, uninterrupted flow.

### ⚡ **Lightning-Fast Sync**
With one command, watch as Chain instantly distributes your latest rules, skills, and workflows across your entire AI arsenal. Updates propagate at the speed of thought.

### 🔗 **Forged in Steel**
Built with TypeScript precision and tested across 424+ test cases, Chain is the unbreakable backbone your AI development workflow deserves.

## The Chain Experience

- **🌐 Universal Adapter Network** — Seamlessly connect to 20+ AI editors: Cursor, Windsurf, Claude Code, Kiro, Trae, Gemini, Copilot, Codex, Aider, Roo, KiloCode, Antigravity, Bolt, Warp, Replit, Cline, Amazon Q, Junie, Augment, Zed, Continue
- **⚙️ Single Source of Truth** — Your `.chain/` directory becomes the master forge where all rules, skills, and workflows are crafted once and distributed everywhere
- **🎯 Intelligent Context Injection** — PROJECT.md automatically enriches every AI editor with deep project understanding
- **🔧 Precision Overrides** — Fine-tune connections per editor while maintaining the golden chain of consistency
- **🌟 Dynamic Entry Points** — Auto-generates `.cursorrules`, `.windsurfrules`, `CLAUDE.md`, `AGENTS.md`, and more
- **🔌 MCP Integration** — Distributes Model Context Protocol servers across your connected editors
- **🌲 Cross-Project Forest** — Plant your rules once and watch them grow across multiple projects
- **🔄 Auto-Sync Intelligence** — Smart promotion, diff detection, and orphan cleanup keep your chain pristine
- **🧠 Tech Stack Telepathy** — Automatically detects your language, framework, runtime, and database
- **📚 Template Treasury** — 8 battle-tested stack templates ready to deploy
- **🎨 Skill Arsenal** — 7+ core skills, 14 specialist roles, 4 workflow templates
- **🔌 Extensible Architecture** — Plugin system for any editor, now or future
- **👁️ Crystal Ball Mode** — Preview changes before they materialize
- **👁️ Eternal Watch** — Auto-sync on every file change, keeping your chain ever-strong
- **✅ Guardian Validation** — Pre-flight checks ensure your chain remains unbroken
- **🛠️ Smart Settings** — Auto-generates `.editorconfig` and `.vscode/settings.json`
- **🧹 Intelligent Cleanup** — Removes broken links while preserving your valuable content
- **🚫 Smart Git Integration** — Manages generated files intelligently
- **⚡ Pre-Commit Power** — Auto-installs hooks that strengthen your chain before every commit
- **🏗️ Monorepo Mastery** — Conquer entire code forests with `sync-all`

## Installation

### 🚀 Quick Start (Recommended)

```bash
# Clone and setup instantly
git clone https://github.com/martijnbokma/chain.git my-project
cd my-project
bun install
bun run build
bun run chain init
```

### 📦 Alternative Methods

```bash
# Method 1: Use bunx (no installation)
bunx github:martijnbokma/chain@latest init

# Method 2: Install as dev dependency
bun add -D github:martijnbokma/chain
bun run chain init

# Method 3: Manual setup
git clone https://github.com/martijnbokma/chain.git
cd chain
bun install
bun run build
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

## Quick Start: Forge Your Chain in 3 Steps

```bash
# 1. Initiate the connection (auto-detects your tech stack, asks for editors)
bun run chain init

# 2. Craft your content in .chain/ and fine-tune chain.yaml

# 3. Strengthen all connections
bun run chain sync
```

**Pro tip:** Add this alias to your shell for easier usage:
```bash
echo 'alias chain="bun run chain"' >> ~/.zshrc
source ~/.zshrc
```

That's it. The wizard forges your initial chain with minimal questions, auto-detecting your tech stack and establishing connections to your chosen editors.

For teams building interconnected project ecosystems:

```bash
bun run chain init --advanced
```

## Your Chain Architecture

After initiation, your project transforms into a connected powerhouse:

```
your-project/
├── chain.yaml                   # The master key — editors, metadata, tech stack
├── .chain/                      # Your forge (central content hub)
│   ├── PROJECT.md               # Project soul → flows to all entry points
│   ├── rules/                   # Development laws → all editors
│   │   └── project-conventions.md
│   ├── skills/                  # AI abilities → all editors
│   │   ├── code-review.md
│   │   ├── debug-assistant.md
│   │   ├── refactor.md
│   │   └── ...
│   ├── workflows/               # Dev processes → Windsurf, Kiro
│   │   ├── create-prd.md
│   │   ├── generate-tasks.md
│   │   └── ...
│   └── overrides/               # Editor-specific fine-tuning
│       ├── cursor/
│       ├── claude/
│       └── ...

│ # ↓ AUTO-FORGED by `chain sync` ↓
├── .cursor/rules/               # Cursor connections
├── .windsurf/rules/             # Windsurf connections
├── .claude/rules/               # Claude connections
├── CLAUDE.md                    # Claude entry point
├── .cursorrules                 # Cursor entry point
├── .windsurfrules               # Windsurf entry point
├── AGENTS.md                    # Codex/Aider entry point
└── ...
```

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

## The Connected Editor Ecosystem

Chain connects you to the complete AI development landscape:

| Editor | Rules | Skills | Workflows | MCP | Entry Point |
|---|---|---|---|---|---|
| **Cursor** | `.cursor/rules/` | `.cursor/commands/` | — | `.cursor/mcp.json` | `.cursorrules` |
| **Windsurf** | `.windsurf/rules/` | `.windsurf/skills/` | ✓ | — | `.windsurfrules` |
| **Claude Code** | `.claude/rules/` | `.claude/skills/` | — | `.claude/settings.json` | `CLAUDE.md` |
| **Kiro** | `.kiro/steering/` | `.kiro/specs/workflows/` | ✓ | `.kiro/settings/mcp.json` | — |
| **Trae** | `.trae/rules/` | `.trae/skills/` | — | — | — |
| **Gemini** | `.gemini/` | — | — | — | `GEMINI.md` |
| **Copilot** | `.github/instructions/` | `.github/instructions/` | — | `.vscode/mcp.json` | `.github/copilot-instructions.md` |
| **Codex** | `.codex/` | `.codex/skills/` | — | — | `AGENTS.md` |
| **Aider** | `.aider/` | — | — | — | `AGENTS.md` |
| **Roo** | `.roo/rules/` | `.roo/skills/` | — | `.roo/mcp.json` | — |
| **KiloCode** | `.kilocode/rules/` | `.kilocode/skills/` | — | `.kilocode/mcp.json` | — |
| **Antigravity** | `.agent/rules/` | `.agent/skills/` | — | — | — |
| **Bolt** | `.bolt/` | — | — | — | `.bolt/prompt` |
| **Warp** | `.warp/rules/` | — | — | — | `WARP.md` |
| **Replit** | `.replit/` | — | — | — | `replit.md` |
| **Cline** | `.clinerules/` | — | — | — | — |
| **Amazon Q** | `.amazonq/rules/` | — | — | `.amazonq/default.json` | — |
| **Junie** | `.junie/` | — | — | — | `.junie/guidelines.md` |
| **Augment** | `.augment/rules/` | — | — | — | — |
| **Zed** | `.zed/rules/` | — | — | — | `.rules` |
| **Continue** | `.continue/rules/` | — | — | — | — |

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

Automatically copied to `.chain/skills/` during initiation:

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

Copied to `.chain/workflows/` during initiation:

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

**Local content always takes priority** over shared content. New local files are auto-promoted to the central hub during sync. Diffs between local and shared content are detected with interactive prompts to keep your chain strong.

## Chain Commands: Master Your Connections

| Command | Description |
|---|---|
| `chain init` | Forge your initial chain (auto-detects tech stack, quick setup) |
| `chain init --advanced` | Master forge wizard with content sources and detailed tech stack |
| `chain init --force` | Re-forge (overwrites existing chain) |
| `chain init --shared` | Create shared content hub for cross-project sync |
| `chain sync` | Strengthen all connections to enabled editors |
| `chain sync --dry-run` | Preview chain strengthening before execution |
| `chain validate` | Verify chain integrity and content |
| `chain watch` | Eternal watch mode - auto-sync on every change |
| `chain sync-all` | Conquer entire monorepo forests |
| `chain sync-all --dry-run` | Preview monorepo conquest |
| `chain promote <file>` | Promote local content to shared hub |
| `chain promote <file> --force` | Force promotion to shared hub |

## CI/CD Integration: Automated Chain Strength

### npm scripts (auto-forged by `init`)

```json
{
  "scripts": {
    "sync": "chain sync",
    "sync:dry": "chain sync --dry-run",
    "sync:watch": "chain watch"
  }
}
```

### GitHub Actions - Chain Integrity Guardian

```yaml
name: Chain Integrity Check
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
      - run: chain sync
      - name: Verify chain integrity
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "::error::Chain is out of sync!"
            echo "Run 'chain sync' and commit the changes."
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

See [docs/GUIDE.md](docs/GUIDE.md) for the complete chain mastery guide covering all features in exhaustive detail.

## Contributing: Strengthen the Chain

Want to help forge a stronger Chain? See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, architecture insights, and contribution guidelines.

## License

MIT - Forge freely, share widely.

---

**Chain: Where fragmented AI development becomes unified power.**

*Break the silos. Forge the connection. Transform your workflow.*
