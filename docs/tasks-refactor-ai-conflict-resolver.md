# Tasks: Refactor ai-conflict-resolver.ts

> PRD: docs/prd-refactor-ai-conflict-resolver.md

## Task 1: Extract types
- [x] 1.1 Create `src/sync/ai-conflict-resolver-types.ts`
- [x] 1.2 Move ConflictDetails, MergeResult, ConflictResolutionOptions
- [x] 1.3 Update ai-conflict-resolver.ts to import and re-export
- [x] 1.4 Update sync-executor.ts import path (if needed)

## Task 2: Add unit tests
- [x] 2.1 Create tests/sync/ai-conflict-resolver.test.ts
- [x] 2.2 Test: detectConflict (both-modified, content-conflict, structural-conflict)
- [x] 2.3 Test: performAIMerge for each change type
- [x] 2.4 Test: resolveBatchConflicts
- [x] 2.5 Test: mergeBothModified 3-way merge (local/remote/base)
- [x] 2.6 All tests pass

## Task 3: Verify
- [x] 3.1 `bun run typecheck` passes
- [x] 3.2 `bun run test:run` passes
- [x] 3.3 Update REFACTOR_CANDIDATES.md status to ✅
- [x] 3.4 Remove ai-conflict-resolver from Modules Without Tests
