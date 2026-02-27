# Migration Guide: File Sync → MCP-Only

Chain has moved to **MCP-only**. Content is no longer synced to editor-specific directories. Instead, the Chain MCP server serves rules, skills, and workflows as prompts that you select when needed.

## What Changed

| Before (File Sync) | After (MCP-Only) |
|--------------------|------------------|
| Content copied to `.cursor/rules/`, `.windsurf/rules/`, etc. | Content stays in `.chain/`; MCP server reads it live |
| Entry points: `.cursorrules`, `CLAUDE.md`, `AGENTS.md` | No entry points; use `@chain_full_context`, `@chain_rules`, etc. |
| `chain sync` copied files to all editors | `chain sync` generates MCP configs only |
| Many editors (Windsurf, Trae, Gemini, etc.) | Only MCP-capable editors (Cursor, Claude, Kiro, Copilot, Roo, KiloCode, Amazon Q) |
| `chain promote` for SSOT sync | Removed (deprecated) |
| `chain watch` synced content on change | MCP reads live; watch only regenerates configs when needed |

## Migration Steps

### 1. Update `chain.yaml`

Remove editors that no longer have MCP support. Only these editors are supported:

```yaml
editors:
  cursor: true
  claude: true
  kiro: false
  copilot: false
  roo: false
  kilocode: false
  amazonq: false
```

If you had `windsurf`, `trae`, `gemini`, `codex`, `aider`, etc., remove them or set them to `false`. They are no longer supported.

### 2. Ensure Chain MCP Server in `mcp_servers`

Your `chain.yaml` should include:

```yaml
mcp_servers:
  - name: chain
    command: npx
    args: ["-y", "@silverfox14/chain", "mcp-server"]
```

If missing, add it. Run `chain init` again if you prefer the wizard to add it.

### 3. Run `chain sync`

```bash
npx @silverfox14/chain sync
```

This generates `.cursor/mcp.json`, `.claude/settings.json`, etc. — no file copying.

### 4. Remove Old Generated Files (Optional)

If you previously committed editor-specific directories, you may want to clean up:

```bash
npx @silverfox14/chain clean
```

This removes generated MCP configs and editor directories. **Do not run** if you have manually added files in those directories — review first.

Or manually remove:

- `.cursor/rules/` (if it contained only Chain-synced content)
- `.windsurf/` (no longer supported)
- `.cursorrules`, `.windsurfrules`, `CLAUDE.md`, `AGENTS.md`, `WARP.md`, etc.

Your `.chain/` directory is unchanged — that is your source of truth.

### 5. Use Prompts in Your Editor

Open your project in Cursor, Claude Code, or another MCP-capable editor. When you need context:

- **Full context:** `@chain_full_context`
- **Rules only:** `@chain_rules`
- **Skills only:** `@chain_skills`
- **Workflows only:** `@chain_workflows`

Content is served live — no sync needed when you edit `.chain/`.

## Content Sources

If you use `content_sources` to share rules across projects, nothing changes. The MCP server resolves `content_sources` the same way. Your shared content continues to work.

## Deprecated Commands

| Command | Status |
|---------|--------|
| `chain promote` | Deprecated; shows warning |
| `chain watch` | Still works; only regenerates MCP configs (content is live) |

## FAQ

### Do I need to run `chain sync` after editing `.chain/`?

No. The MCP server reads `.chain/` live. Run `chain sync` only when you add a new editor, change `chain.yaml`, or want to regenerate MCP configs.

### What about Windsurf / Trae / Gemini?

These editors are no longer supported because they don't have MCP config paths in Chain's registry. If your editor adds MCP support, you can add it as a custom editor with `mcp_config_path`.

### Can I keep my old `.cursor/rules/` files?

Yes. If you have manually created files there, they remain. Chain no longer writes to them. The MCP server serves from `.chain/` only.

### Will my pre-commit hook still work?

Yes. The hook runs `chain sync` and adds generated files. It now adds MCP configs (`.cursor/mcp.json`, etc.) instead of rules/skills directories.
