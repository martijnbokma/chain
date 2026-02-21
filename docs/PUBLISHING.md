# Publishing Chain to npm

This guide explains how to publish `@silverfox14/chain` to the npm registry.

## Prerequisites

### 1. npm Account

- Create an account at [npmjs.com](https://www.npmjs.com/signup) if you don't have one.
- For scoped packages (`@silverfox14/chain`), you must either:
  - Own the `silverfox14` organization on npm, or
  - Be a member with publish rights.

### 2. Log In to npm

```bash
npm login
```

You'll be prompted for:
- **Username** — your npm username
- **Password** — your npm password
- **Email** — your email (public)
- **OTP** — one-time password if 2FA is enabled

Verify you're logged in:

```bash
npm whoami
```

### 3. Ensure Build Tools Are Ready

```bash
bun install
bun run typecheck
bun run test:run
bun run build
```

---

## Pre-Publish Checklist

Before every publish, verify:

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `bun run typecheck` | No TypeScript errors |
| 2 | `bun run test:run` | All tests pass |
| 3 | `bun run build` | `dist/` is up to date |
| 4 | `git status` | No uncommitted changes (optional but recommended) |

The `prepublishOnly` script in `package.json` runs steps 1–3 automatically when you run `npm publish`.

---

## Version Bumping

Use [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.5 → 0.1.6): Bug fixes, small changes
- **Minor** (0.1.5 → 0.2.0): New features, backward compatible
- **Major** (0.1.5 → 1.0.0): Breaking changes

### Option A: npm version (recommended)

```bash
# Patch: 0.1.5 → 0.1.6
npm version patch

# Minor: 0.1.5 → 0.2.0
npm version minor

# Major: 0.1.5 → 1.0.0
npm version major
```

This updates `package.json`, creates a git tag, and commits (if in a git repo).

### Option B: Manual edit

Edit `version` in `package.json`, then:

```bash
git add package.json
git commit -m "chore: bump version to X.Y.Z"
git tag vX.Y.Z
```

---

## Publishing

### 1. Dry Run (recommended first time)

See what would be published without actually publishing:

```bash
npm publish --dry-run
```

This shows:
- Files that will be included (`dist/`, `templates/`, `package.json`, etc.)
- Package size
- Any validation issues

### 2. Publish to npm

**Important:** Scoped packages (`@scope/name`) are private by default. To publish publicly:

```bash
npm publish --access public
```

For a one-time config so you don't need `--access public` every time, add to `package.json`:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

Then you can simply run:

```bash
npm publish
```

### 3. Verify Publication

```bash
npm view @silverfox14/chain
```

Or visit: `https://www.npmjs.com/package/@silverfox14/chain`

---

## Quick Reference

```bash
# Full publish workflow
bun run typecheck && bun run test:run && bun run build
npm version patch
npm publish --access public
```

---

## Troubleshooting

### "You must be logged in to publish packages"

```bash
npm login
npm whoami
```

### "You do not have permission to publish"

- Ensure you're a member of the `silverfox14` org with publish rights.
- Or change the scope in `package.json` to your own scope (e.g. `@yourusername/chain`).

### "Package name already exists"

- The name `@silverfox14/chain` is taken. Use a different scope or name.
- For unscoped names, you cannot republish a name that exists.

### "Cannot publish over existing version"

- Bump the version: `npm version patch` (or minor/major).

### "ENOENT: no such file or directory, open 'dist/index.js'"

- Run `bun run build` before publishing.
- The `prepublishOnly` script should do this; if it fails, run build manually.

### 2FA / OTP

If you have two-factor auth enabled, npm will prompt for a one-time password during `npm publish`. Use your authenticator app or `npm otp` to get the code.

---

## Files Included in the Package

The `files` field in `package.json` controls what gets published:

```json
"files": ["dist", "templates"]
```

- **dist/** — Built CLI and library (from `tsup`)
- **templates/** — Rules, skills, workflows, stacks

`package.json`, `README.md`, and `LICENSE` are always included by npm.

---

## Related

- [npm docs: Publishing scoped packages](https://docs.npmjs.com/cli/v10/commands/npm-publish#publishing-scoped-packages)
- [Semantic Versioning](https://semver.org/)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Development setup
