# Tasks: Refactor smart-sync.ts

> PRD: docs/prd-refactor-smart-sync.md

## Task 1: Fix `any` types
- [x] 1.1 Replace `as any` on line 337 with `ConflictDetails`
- [x] 1.2 Replace `as any` on lines 341–342 with proper `ConflictResolutionOptions` construction
- [x] 1.3 Replace `as any` on line 348 with `MergeResult`
- [x] 1.4 Verify no remaining `any` in smart-sync.ts

## Task 2: Extract types
- [x] 2.1 Create `src/sync/smart-sync-types.ts` with ContentHash, SyncContentMetadata, SmartSyncResult
- [x] 2.2 Update smart-sync.ts to import from smart-sync-types.ts

## Task 3: Extract directory comparator
- [x] 3.1 Create `src/sync/smart-sync/directory-comparator.ts`
- [x] 3.2 Move `scanDirectory`, `compareDirectories`, `getFileMetadata` logic
- [x] 3.3 Export `DirectoryComparator` class
- [x] 3.4 Update SmartSyncEngine to use DirectoryComparator

## Task 4: Extract sync executor
- [x] 4.1 Create `src/sync/smart-sync/sync-executor.ts`
- [x] 4.2 Move add/update/remove/conflict processing logic
- [x] 4.3 Reduce nesting in conflict resolution block (extracted processConflict)
- [x] 4.4 Update SmartSyncEngine to use SyncExecutor

## Task 5: Simplify SmartSyncEngine
- [x] 5.1 SmartSyncEngine becomes thin orchestrator (~170 lines)
- [x] 5.2 Ensure public API unchanged
- [x] 5.3 Add re-export in smart-sync.ts for backward compatibility

## Task 6: Add unit tests
- [x] 6.1 Add directory-comparator.test.ts (4 tests)
- [x] 6.2 Add smart-sync.test.ts (4 tests: scan, compare, dry-run, live sync)
- [x] 6.3 All tests pass

## Task 7: Verify
- [x] 7.1 `bun run typecheck` passes
- [x] 7.2 `bun run test:run` passes (444 tests)
- [x] 7.3 Update REFACTOR_CANDIDATES.md status to ✅
