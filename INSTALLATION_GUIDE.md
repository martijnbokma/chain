# Chain - Complete Installation & Configuration Guide

> **👋 Who is this guide for?** This guide helps you install and configure Chain, even if you don't have much technical experience. We explain every step clearly with checkpoints.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Configuration Checkpoints](#configuration-checkpoints)
5. [Verification & Testing](#verification--testing)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Advanced Configuration](#advanced-configuration)
8. [Next Steps](#next-steps)

---

## 🎯 Why "Chain"?

**Chain** is more than just a name — it's a metaphor for what this tool does:

### 🔗 The Chain Metaphor
- **Connection**: Like a chain, it connects all your AI editors together
- **Strength**: Each link (editor) strengthens the whole system
- **Unity**: All editors work as one unified system
- **Flow**: Information flows smoothly through every link in the chain

### 🤖 The AI Connection
The name "Chain" perfectly captures the AI aspect:
- **Chain of Thought**: Just like AI reasoning, your rules flow through a logical chain
- **Blockchain**: Modern, secure, and distributed — like your AI configurations
- **Supply Chain**: Efficiently distributes content to all your AI tools
- **Value Chain**: Each editor adds value to your development workflow

### 🚀 Why It Works
- **Memorable**: Short, simple, and easy to remember
- **Technical**: Sounds modern and professional
- **Universal**: Works across all languages and cultures
- **Descriptive**: Represents exactly what the tool does — chaining everything together

**Chain**: Where AI meets connectivity, creating a seamless development experience across all your editors.

---

## Prerequisites

### 🎯 What do you need?

**Essential requirements:**
- **Node.js**: Version 18 or higher (this is the foundation for many development tools)
- **Package Manager**: Bun (recommended), npm, or pnpm (these are tools to install software)
- **AI Editors**: At least one supported AI editor (see list below)

**Optional but helpful:**
- **Git Repository**: For automatic synchronization (if you use Git)

**❓ How to check this?**
```bash
# Check Node.js version
node --version
# Should show v18+, for example: v20.0.0

# Check if you have a package manager
bun --version  # or npm --version
```

**🔧 No Node.js?** Download it from [nodejs.org](https://nodejs.org) (choose the LTS version).

### 🤝 Supported AI Editors

Choose the editor you use. Chain works with these editors:

| Editor | What gets created? | How it works |
|--------|-------------------|-------------|
| **Cursor** | `.cursorrules` + `.cursor/rules/` | Rules appear in Cursor's AI panel |
| **Windsurf** | `.windsurfrules` + `.windsurf/rules/` | Rules and skills in Windsurf |
| **Claude Code** | `CLAUDE.md` + `.claude/rules/` | Claude reads these files automatically |
| **Kiro** | `.kiro/steering/` + workflows | For advanced workflows |
| **Trae** | `.trae/rules/` | Trae AI rules |
| **Gemini** | `.gemini/` | Google Gemini integration |
| **Copilot** | `.github/instructions/` | GitHub Copilot instructions |
| **Codex** | `AGENTS.md` | Codex AI agents |
| **Aider** | `AGENTS.md` | Aider terminal AI |
| **Roo** | `.roo/rules/` + `.roo/skills/` | Roo AI assistant |
| **KiloCode** | `.kilocode/rules/` + `.kilocode/skills/` | KiloCode editor |
| **Antigravity** | `.agent/rules/` + `.agent/skills/` | Antigravity editor |
| **Bolt** | `.bolt/prompt` | Bolt.new editor |
| **Warp** | `WARP.md` + `.warp/rules/` | Warp terminal |
| **Replit** | `replit.md` + `.replit/` | Replit editor |
| **Cline** | `.clinerules/` | Cline VS Code extension |
| **Amazon Q** | `.amazonq/rules/` + `.amazonq/default.json` | Amazon Q Developer |
| **Junie** | `.junie/guidelines.md` + `.junie/` | Junie AI assistant |
| **Augment** | `.augment/rules/` | Augment Code |
| **Zed** | `.rules` + `.zed/rules/` | Zed editor |
| **Continue** | `.continue/rules/` | Continue.dev |

**💡 Tip**: You only need to choose one editor to start. You can add more later.

---

## Installation Methods

### 🚀 Method 1: Quick Clone (Recommended for beginners)

**Perfect for getting started immediately!** Clone and use directly:

```bash
# Clone to your project folder
git clone https://github.com/martijnbokma/ai-toolkit.git my-project
cd my-project

# Install dependencies and build
bun install
bun run build

# Start using Chain
bun run chain init
```

**✅ Advantages**: 
- No installation required
- Works immediately
- No package manager confusion
- Latest features included
- Perfect for beginners

**⚠️ Disadvantages**: 
- Includes full source code (larger download)

**� When to use?**: This is the recommended method for most users, especially beginners.

### 🔧 Method 3: Local Development (For contributors)

**Perfect for development and testing!** Use it directly from your local copy:

```bash
# Navigate to the ai-toolkit folder
cd /path/to/ai-toolkit

# Install dependencies and build
bun install
bun run build

# Use it locally
bun run chain init

# Or create a shell alias for easier use
echo 'alias chain="bun run chain"' >> ~/.zshrc
source ~/.zshrc
```

**✅ Advantages**: 
- Works offline after initial clone
- Latest development features
- Perfect for testing changes
- Contribute to the project

**⚠️ Disadvantages**: 
- Requires manual building
- Only works on this machine

**💡 When to use?**: Use this method when you're developing Chain or want to test the latest features.

### 👥 Method 4: Project Installation (For teams)

Install as part of your project using GitHub source:

```bash
# With Bun
bun add -D github:martijnbokma/ai-toolkit

# With npm
npm install -D github:martijnbokma/ai-toolkit

# With pnpm
pnpm add -D github:martijnbokma/ai-toolkit

# Then use in your project
bun run chain init
npm run chain init
pnpm chain init
```

**✅ Advantages**: 
- Version stays the same for team members
- Works offline too
- Good for team projects

**⚠️ Disadvantages**: 
- You have to update it yourself when there's a new version

**🤔 When to choose?**: Choose this method if you work in a team or want to work offline.

### 🌐 Method 4: Global Installation

Install once for all projects:

```bash
bun add -g chain
npm install -g chain
pnpm add -g chain
```

**✅ Advantages**: 
- Available everywhere
- One-time installation

**⚠️ Disadvantages**: 
- Can cause problems between different projects
- Harder to manage versions

**⚠️ Warning**: This method is not recommended for beginners because it can be confusing when you work on multiple projects.

---

## 📋 Step-by-Step Setup

### Step 1: Navigate to Your Project

**🎯 What you need to do:**
Open your terminal and navigate to the folder where your project is located.

```bash
# Example: go to your project folder
cd /Users/yourname/projects/my-project

# Or if you're on Windows
cd C:\Users\yourname\projects\my-project
```

**✅ Check:** You should be in the main folder of your project (where `package.json` is located).

**❓ How do you know you're in the right place?**
```bash
ls  # or dir on Windows
# You should see package.json (if you have a Node.js project)
```

### Step 2: Clone and Setup Chain

**🎯 What you need to do:**
Run these commands in your terminal:

```bash
# Clone Chain to your project
git clone https://github.com/martijnbokma/ai-toolkit.git chain-tools

# Install dependencies
cd chain-tools
bun install

# Build Chain
bun run build

# Go back to your project
cd ..

# Create shell alias for easy use
echo 'alias chain="bun run chain"' >> ~/.zshrc
source ~/.zshrc

# Initialize Chain in your project
bun run chain init
```

**🤖 What happens (automatically!):**
- Chain detects your technology (language, framework, database)
- Chain asks which AI editors you want to connect
- Chain creates the necessary files and folders
- Chain sets up your initial configuration
- Chain installs git hooks (if you use Git)
- Adds helpful scripts to your project
- Copies examples
- Syncs with your AI editors

**✅ Check:** You should see a success message with a list of created files.

**🎉 Example of what you'll see:**
```
🚀 chain setup
✓ Created: chain.yaml — project configuration
✓ Created: .chain/PROJECT.md — project context
✓ Created: .chain/rules/ — project rules
✓ Created: .chain/skills/ — AI skills/commands
✓ Synced 15 file(s) to editors
Done! Your editors are ready.
```

### Step 3: Choose Your AI Editors

**🎯 What you need to do:**
The installation wizard will ask which AI editors you use. Choose the editors you have:

```
? Which AI editors do you use? (Space to select, Enter to confirm)
❯◉ cursor     # Use spacebar to select
 ◉ windsurf   # Enter to confirm
 ◉ claude
 ⬡ kiro
 ⬡ trae
 ⬡ gemini
```

**💡 How does the interface work?**
- **Arrow keys**: Navigate through the list
- **Spacebar**: Select/deselect an editor
- **Enter**: Confirm your choice

**✅ Check:** At least one editor should be selected.

**🤔 Which editor should I choose?**
- **Cursor**: If you use the Cursor editor
- **Windsurf**: If you use Windsurf from Codeium
- **Claude**: If you use Claude Code
- Choose the one you actually use!

### Step 4: Review Your Configuration

**🎯 What you need to do:**
Open the file `chain.yaml` in your editor (VS Code, Cursor, etc.)

**🔍 What you'll see:**
```yaml
version: "1.0"

editors:
  cursor: true      # ✅ Active if you use this
  windsurf: true    # ✅ Active if you use this
  claude: true      # ✅ Active if you use this
  # Other editors are set to false

metadata:
  name: "My Project"           # Change this to your project name
  description: "Description"    # Short description
tech_stack:
  language: typescript   # e.g: javascript, python, go
  framework: nextjs      # e.g: react, vue, django
  database: supabase     # e.g: postgresql, mongodb
  runtime: node          # e.g: python, docker
```

**✅ Check:** Verify that your tech stack is correctly detected.

**🔧 Need to adjust?** You can manually adjust the fields if Chain detected something incorrectly.

### Step 5: Describe Your Project

**🎯 What you need to do:**
Open the file `.chain/PROJECT.md` and fill in information about your project.

**📝 What you should fill in:**
```markdown
# Project Context

## Overview
[This is a brief description of what your project does]
Example: A web application that helps users manage tasks.

## Architecture
[Describe the main structure of your project]
Example: Frontend in React, backend in Node.js, database in PostgreSQL.

## Tech Stack
Language: TypeScript
Framework: Next.js
Database: Supabase
Runtime: Node.js

## Directory Structure
src/
├── components/     # React components
├── pages/          # Next.js pages
├── lib/            # Utility functions
└── types/          # TypeScript types

## Conventions
- Use TypeScript strict mode
- Components in PascalCase (MyComponent)
- Functions in camelCase (myFunction)
- All functions have JSDoc comments

## Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

**✅ Check:** Fill in at least the **Overview** and **Architecture** sections.

**💡 Why is this important?** AI editors use this information to give better suggestions that fit your project!

---

## 🔍 Configuration Checkpoints

### ✅ Checkpoint 1: Basic Setup Validation

**🎯 What you need to do:**
Run this command to verify your setup:

```bash
npx chain validate
```

**✅ What you should see:**
```
✔ Configuration is valid
✔ Editors enabled: cursor, windsurf, claude
✔ Content directory exists: .chain/
Content: 1 rule(s), 5 skill(s), 3 workflow(s)
✔ Validation passed — ready to sync!
```

**❗ What if there are errors?**
See the [Common Issues & Solutions](#common-issues--solutions) section below.

### ✅ Checkpoint 2: Test Sync (Preview)

**🎯 What you need to do:**
Test what will happen without actually creating files:

```bash
npx chain sync --dry-run
```

**✅ What you'll see:** A list of files that would be created.

**💡 Why is this useful?** This way you can check if everything is configured correctly before actually creating files.

### ✅ Checkpoint 3: Full Sync

**🎯 What you need to do:**
Run the actual synchronization:

```bash
npx chain sync
```

**✅ What you should see:**
```
✔ Configuration loaded

Syncing to 3 editor(s): cursor, windsurf, claude
ℹ Found 1 rule(s)
  ✓ .chain/rules/project-conventions.md → .cursor/rules/project-conventions.md
  ✓ .chain/rules/project-conventions.md → .windsurf/rules/project-conventions.md
  ✓ .chain/rules/project-conventions.md → .claude/rules/project-conventions.md
ℹ Found 5 skill(s)
  ✓ .chain/skills/code-review.md → .cursor/commands/code-review.md
  ✓ .chain/skills/code-review.md → .windsurf/workflows/code-review.md
  ✓ .chain/skills/code-review.md → .claude/skills/code-review.md
  ✓ generated → .cursorrules
  ✓ generated → .windsurfrules
  ✓ generated → CLAUDE.md

Sync Summary
✓ Synced: 15 file(s)
✓ Sync complete!
```

**🎉 Congratulations! Your AI editors are now configured!****

### ✅ Checkpoint 4: File Verification

**🎯 What you need to do:**
Check if the files were actually created:

```bash
# For Cursor
ls -la .cursorrules .cursor/rules/

# For Windsurf
ls -la .windsurfrules .windsurf/rules/

# For Claude
ls -la CLAUDE.md .claude/rules/
```

**✅ What you should see:** All mentioned files should exist.

**❓ No files?** Check if you selected the correct editor in `chain.yaml`.

---

## 🧪 Verification & Testing

### Test 1: Editor Recognition

**🎯 What you need to do:**
Open your AI editor and check if it recognizes the files.

**Cursor:**
- Check if `.cursorrules` appears in the rules panel
- Verify that rules appear under `.cursor/rules/`

**Windsurf:**
- Check if `.windsurfrules` is loaded
- Verify that skills appear in the skills panel

**Claude Code:**
- Check if `CLAUDE.md` is loaded
- Verify that rules appear under `.claude/rules/`

**✅ How do you know it works?** If you can see the rules and skills in your editor, everything is configured correctly!

### Test 2: Content Test

**🎯 What you need to do:**
Create a simple test rule to see if synchronization works:

```bash
echo "# Test Rule
This is a test to check if sync works." > .chain/rules/test-rule.md
```

Sync and verify:
```bash
npx chain sync
ls .cursor/rules/test-rule.md .windsurf/rules/test-rule.md .claude/rules/test-rule.md
```

**✅ What you should see:** The test-rule.md should appear in all configured editor folders.

### Test 3: Automatic Features

**🎯 What you need to do:**
Check if automatic features work:

```bash
# Check if git hook is installed
cat .git/hooks/pre-commit

# Check if npm scripts were added
cat package.json | grep -A 5 '"scripts"'
```

**✅ What you should see:**
- Git hook should contain a sync command
- package.json should have sync, sync:dry, and sync:watch scripts

**💡 Why is this important?** These automatic features ensure you always work with the latest configuration.

---

## 🆘 Common Issues & Solutions

### ❌ Problem: "chain is already initialized"

**🔍 What it means:** You're trying to run `init` on a project that's already configured.

**✅ Solution:** 
```bash
# Reinitialize (overwrites existing config)
npx chain init --force

# Or just edit the existing configuration
vim chain.yaml  # or open in your editor
```

**💡 Tip**: Only use `--force` if you want to replace the existing configuration.

### ❌ Problem: "No editors enabled in config"

**🔍 What it means:** All editors are set to `false` in `chain.yaml`.

**✅ Solution:** Edit `chain.yaml` and set at least one editor to `true`:
```yaml
editors:
  cursor: true  # Change from false to true
  windsurf: true
  claude: false
```

**💡 Tip**: Only set editors to `true` that you actually use.

### ❌ Problem: "Content directory not found"

**🔍 What it means:** The `.chain/` folder is missing.

**✅ Solution:** Run the initialization again:
```bash
npx chain init
```

**💡 Tip**: If the folder exists but isn't found, check if you're in the correct project folder.

### ❌ Problem: "Tech stack detection failed"

**🔍 What it means:** Chain couldn't automatically detect your technology.

**✅ Solution:** Manually set your tech stack in `chain.yaml`:
```yaml
tech_stack:
  language: python      # e.g: javascript, typescript, go
  framework: django     # e.g: react, vue, nextjs, flask
  database: postgresql  # e.g: mongodb, mysql, supabase
  runtime: python       # e.g: node, docker, python
```

**💡 Tip**: You don't need to fill in all fields. Only what's relevant for your project.

### ❌ Problem: Sync creates no files

**🔍 What it means:** There's no content in the `.chain/` folders.

**✅ Solution:** Add some content:
```bash
# Add a rule
echo "# My Rule
Follow these conventions..." > .chain/rules/my-rule.md

# Add a skill
echo "# My Skill
Help me with this task..." > .chain/skills/my-skill.md

# Then sync
npx chain sync
```

**💡 Tip**: Chain only syncs files that actually exist.

### ❌ Problem: "Permission denied" errors

**🔍 What it means:** Problems with file permissions.

**✅ Solution:** Check and fix permissions:
```bash
# Check permissions
ls -la .chain/

# Fix permissions (if needed)
chmod -R 755 .chain/
```

**💡 Tip**: This problem mainly occurs on Linux/macOS. Windows users rarely have this issue.

### ❌ Problem: MCP server errors

**🔍 What it means:** Problems with MCP server configuration.

**✅ Solution:** Validate MCP configuration:
```bash
npx chain validate
# Look for MCP-related errors
```

**💡 Tip**: MCP is optional. If you don't use it, you can ignore this section.

### ❌ Problem: Git hook not working

**🔍 What it means:** Git hooks are disabled or have permission issues.

**✅ Solution:** 
```bash
# Enable git hooks
git config core.hooksPath .git/hooks

# Make hook executable
chmod +x .git/hooks/pre-commit
```

**💡 Tip**: If you don't use Git, you can ignore this problem.

### ❌ Problem: Editor not reading generated files

**🔍 What it means:** The AI editor doesn't recognize the files.

**✅ Solution:** 
- **Cursor**: Check Cursor settings > AI > Rules
- **Windsurf**: Restart Windsurf
- **Claude**: Check Claude Code settings

**💡 Tip**: Sometimes you need to restart the editor before new files are recognized.

---

## 🔧 Advanced Configuration (Optional)

> **👋 Beginners tip**: The following sections are optional. You can use AI Toolkit perfectly without these advanced features.

### 📋 Template Inheritance

**🎯 What it does:** Use ready-made templates for quick setup.

```yaml
extends:
  - stacks/nextjs  # Uses Next.js settings

tech_stack:
  database: supabase  # Adds database to template
```

**💡 When to use?**: If you want to start with a standard configuration for a specific technology.

### 🔄 Content Sources (Multi-Project)

**🎯 What it does**: Share rules across multiple projects.

```yaml
content_sources:
  - type: local
    path: ../shared-ai-rules  # Local folder with shared rules
  - type: package
    name: "@my-org/ai-rules"  # npm package with rules
```

**💡 When to use?**: If you work on multiple projects and want to reuse the same rules.

### 🎨 Custom Editors

**🎯 What it does**: Add support for unsupported editors.

```yaml
custom_editors:
  - name: supermaven
    rules_dir: .supermaven/rules
    skills_dir: .supermaven/skills
    entry_point: SUPERMAVEN.md

editors:
  supermaven: true
```

**💡 When to use?**: If you use an AI editor that isn't supported by default.

### 🔌 MCP Servers

**🎯 What it does**: Configure MCP servers for advanced integrations.

```yaml
mcp_servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    enabled: true
```

**💡 When to use?**: If you want to use MCP (Model Context Protocol) servers. This is an advanced feature.

### ⚙️ Editor Settings

**🎯 What it does**: Automatically generate editor settings.

```yaml
settings:
  indent_size: 2          # Number of spaces for indentation
  indent_style: space     # Use spaces (not tabs)
  format_on_save: true    # Auto-format on save
```

**💡 Result**: Automatically creates `.editorconfig` and `.vscode/settings.json`.

---

## 🚀 Next Steps

### 1. Add Your Content

**🎯 What to do:** Start adding your project-specific rules, skills, and workflows.

```bash
# Add project rules
echo "# Code Style
- Use TypeScript strict mode
- Follow conventional commits" > .chain/rules/code-style.md

# Add custom skills
echo "# Database Helper
Help me write database queries and migrations" > .chain/skills/database-helper.md
```

**💡 Why?** These rules and skills will be available in all your AI editors!

### 2. Set Up Watch Mode (Optional)

**🎯 What it does:** Automatically sync when you make changes.

```bash
npx chain watch
```

**💡 When to use?**: Use this during development to keep everything in sync automatically.

### 3. Configure CI/CD (Advanced)

**🎯 What it does:** Add Chain to your automated pipeline.

```yaml
# .github/workflows/chain.yml
name: Chain Sync
on:
  push:
    paths: ['.chain/**', 'chain.yaml']
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun chain sync
```

**💡 When to use?**: Only if you use CI/CD and want to ensure consistency.

### 4. Explore Templates

**🎯 What to do:** Browse built-in templates in `.chain/skills/` and `.chain/workflows/` and customize them for your needs.

**💡 Tip**: These templates are great starting points for your own content.

### 5. Join the Community

- 🐛 Report issues: [GitHub Issues](https://github.com/martijnbokma/ai-toolkit/issues)
- 💬 Discuss: [GitHub Discussions](https://github.com/martijnbokma/ai-toolkit/discussions)
- 📖 Documentation: [Full Guide](docs/GUIDE.md)

---

## ⚡ Quick Reference Commands

**🎯 Essential commands for daily use:**

```bash
# Initialize project (one-time setup)
npx chain init

# Advanced initialization (for teams/multi-project)
npx chain init --advanced

# Validate configuration (when things don't work)
npx chain validate

# Sync to editors (after making changes)
npx chain sync

# Preview sync changes (safe test)
npx chain sync --dry-run

# Watch for changes (automatic sync)
npx chain watch

# Sync all projects (for monorepos)
npx chain sync-all

# Promote local file to shared (advanced)
npx chain promote skills/my-skill.md
```

**💡 Beginners tip**: You'll mainly use `init` (once), `sync` (after changes), and `validate` (when troubleshooting).

---

## 🆘 Need Help?

**🔍 Step-by-step troubleshooting:**

1. **Check validation**: `npx chain validate`
   - This tells you if your configuration is correct

2. **Dry-run sync**: `npx chain sync --dry-run`
   - This shows what would happen without making changes

3. **Read the logs**: Check console output for error messages
   - The error messages usually tell you exactly what's wrong

4. **Consult the docs**: See [docs/GUIDE.md](docs/GUIDE.md) for detailed information
   - The full guide has more in-depth explanations

5. **Report issues**: [GitHub Issues](https://github.com/martijnbokma/ai-toolkit/issues)
   - If you're still stuck, ask for help!

**💡 Quick fix checklist:**
- ✅ Are you in the right project folder?
- ✅ Do you have Node.js 18+ installed?
- ✅ Is at least one editor enabled in `chain.yaml`?
- ✅ Does the `.chain/` folder exist?
- ✅ Have you tried running `validate`?

---

## 🎉 You're All Set!

**🎉 Congratulations!** You've successfully installed and configured Chain. Here's what you've accomplished:

✅ **Installed Chain** - Ready to use in seconds with `npx chain init`
✅ **Configured your AI editors** - Rules and skills are now synchronized
✅ **Set up project context** - Your AI editors understand your project
✅ **Created your first content** - Rules and skills are ready to use
✅ **Learned troubleshooting** - You know how to fix common issues

**🚀 What's next?**
- Start adding your own rules and skills to `.chain/`
- Try the `watch` command for automatic syncing
- Explore the built-in templates
- Share with your team if you work together

**💡 Remember**: Chain saves you time by keeping all your AI editors in sync with the same rules and knowledge. Write once, use everywhere!

---

**Happy coding! 🚀**
