# Central Content Setup Guide: Choose Your Shared AI Rules Strategy

Chain gives you multiple options to create and manage your **central content hub** for AI rules, skills, and workflows. Pick the approach that fits your workflow best.

## 🎯 Quick Decision Matrix

| Approach | Best For | Setup Complexity | Maintenance |
|---|---|---|---|
| **Local Folder** | Solo developers, small teams | `chain init --shared` | ⭐ Simple |
| **Git Repository** | Teams wanting version control | ⭐⭐ Medium | ⭐⭐ Medium |
| **npm Package** | Organizations, multi-team | ⭐⭐⭐ Advanced | ⭐⭐⭐ Advanced |

---

## 📁 Option 1: Local Folder (Recommended for Starters)

Perfect for solo developers or small teams who want simplicity.

### Setup Steps

```bash
# 1. Create your central content hub with Chain
chain init --shared

# 2. Add your first rules and skills
# Chain automatically creates ~/.chain/ with the structure for you
```

### Configure in Projects

```yaml
# chain.yaml
content_sources:
  - type: local
    path: ~/.chain
    include: [rules, skills, workflows]
```

### Pros & Cons

✅ **Pros:**
- Zero setup complexity
- Instant updates across projects
- No external dependencies
- Easy to edit with any tool

❌ **Cons:**
- No version control by default
- Manual backup needed
- Harder to share with team members

---

## 🔄 Option 2: Git Repository (Best for Teams)

Ideal for teams that want version control and collaboration.

### Setup Steps

```bash
# 1. Create a Git repository for your AI content
mkdir ai-content-hub
cd ai-content-hub
git init

# 2. Set up the structure
mkdir -p rules skills workflows
echo "# AI Content SSOT" > README.md

# 3. Add initial content
git add .
git commit -m "Initial AI content structure"

# 4. Push to GitHub/GitLab (optional)
git remote add origin https://github.com/yourorg/ai-content-ssot.git
git push -u origin main
```

### Configure in Projects

```yaml
# chain.yaml
content_sources:
  - type: local
    path: ../ai-content-hub  # Relative path
    # or absolute path:
    # path: ~/projects/ai-content-ssot
```

### Team Workflow

```bash
# Team member updates content
cd ../ai-content-hub
echo "New rule" >> rules/new-rule.md
git add . && git commit -m "Add new rule"
git push

# Other team members get updates
git pull
```

### Pros & Cons

✅ **Pros:**
- Full version control history
- Team collaboration
- Branching for experiments
- Rollback capability

❌ **Cons:**
- Requires Git knowledge
- Manual sync for updates
- Merge conflicts possible

---

## 📦 Option 3: npm Package (Enterprise Ready)

Perfect for organizations with multiple teams and formal release processes.

### Setup Steps

```bash
# 1. Create your package
mkdir @myorg-ai-rules
cd @myorg-ai-rules
npm init -y

# 2. Configure package.json
cat > package.json << 'EOF'
{
  "name": "@myorg/ai-rules",
  "version": "1.0.0",
  "description": "Organization's shared AI rules and skills",
  "main": "index.js",
  "files": ["rules", "skills", "workflows"],
  "repository": "https://github.com/myorg/ai-rules",
  "publishConfig": {
    "access": "restricted"
  }
}
EOF

# 3. Add content structure
mkdir -p rules skills workflows
echo "# Org Coding Standards" > rules/coding-standards.md

# 4. Publish to private registry
npm publish
```

### Configure in Projects

```yaml
# chain.yaml
content_sources:
  - type: package
    name: "@myorg/ai-rules"
    include: [rules, skills, workflows]
```

### Update Workflow

```bash
# Update content in the package
cd @myorg-ai-rules
# Make changes...
npm version patch  # or minor, major
npm publish

# Projects get updates with
npm update @myorg/ai-rules
bunx chain sync
```

### Pros & Cons

✅ **Pros:**
- Semantic versioning
- Private registry support
- Dependency management
- Formal release process

❌ **Cons:**
- Complex setup
- Registry costs (private)
- Slower update cycle
- Requires npm knowledge

---

## 🎛️ Option 4: Hybrid Approach (Best of All Worlds)

Combine multiple sources for maximum flexibility.

### Example Configuration

```yaml
# chain.yaml
content_sources:
  # Base content from organization package
  - type: package
    name: "@myorg/ai-rules"
    include: [rules, skills]
  
  # Team-specific workflows
  - type: local
    path: ../team-workflows
    include: [workflows]
  
  # Personal overrides
  - type: local
    path: ./my-personal-rules
    include: [rules]
```

### Priority Order

1. **Local project content** (highest priority)
2. **Local content sources** (medium priority)  
3. **Package content sources** (lowest priority)

---

## 🚀 Quick Start Recommendations

### For Solo Developers
```bash
# Start with local folder (Chain manages it for you)
chain init --shared
# Chain creates ~/.chain/ and sets up the structure
```

### For Small Teams (2-5 people)
```bash
# Start with Git repository
mkdir ai-content-hub && cd ai-content-hub
git init
# Clone in each project
git clone ../ai-content-hub
```

### For Large Organizations
```bash
# Create npm package
mkdir @myorg-ai-rules && cd @myorg-ai-rules
npm init
# Publish to private registry
npm publish
```

---

## 🔄 Migration Between Options

### Local → Git
```bash
cd ~/.chain
git init
git add .
git commit -m "Initial import from local content hub"
```

### Git → npm Package
```bash
cd ai-content-hub
npm init
# Update package.json
npm publish
```

### Any → Hybrid
Simply add multiple `content_sources` to your `chain.yaml`.

---

## 🛠️ Advanced Configuration

### Selective Sync
```yaml
content_sources:
  - type: local
    path: ../shared-content
    include: [rules, skills]  # Only sync rules and skills
```

### Override Behavior
```yaml
content_sources:
  - type: package
    name: "@myorg/ai-rules"
  # Local files automatically override package files
```

### Environment-Specific Sources
```yaml
# Development
content_sources:
  - type: local
    path: ../dev-ai-rules

# Production  
content_sources:
  - type: package
    name: "@myorg/ai-rules-prod"
```

---

## 📚 Next Steps

1. **Choose your content hub approach** based on your team size and needs
2. **Set up your central content** using the guides above
3. **Configure your projects** with the appropriate `content_sources`
4. **Start syncing** with `chain sync`

Need help? Check the [main documentation](../README.md) or [open an issue](https://github.com/martijnbokma/ai-toolkit/issues).
