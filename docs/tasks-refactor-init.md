# Tasks: Refactor init.ts

> PRD: docs/prd-refactor-init.md

## Task 1: Fix any type
- [x] 1.1 Replace `finalConfig as any` with `finalConfig as ToolkitConfig`
- [x] 1.2 Import ToolkitConfig if not already imported
- [x] 1.3 Verify typecheck passes

## Task 2: Verify
- [x] 2.1 `bun run typecheck` passes
- [x] 2.2 `bun run test:run` passes (including init.test.ts)
- [x] 2.3 Update REFACTOR_CANDIDATES.md status to ✅
