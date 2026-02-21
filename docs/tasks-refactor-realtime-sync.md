# Tasks: Refactor realtime-sync.ts

> PRD: docs/prd-refactor-realtime-sync.md

## Task 1: Extract types
- [x] 1.1 Create `src/sync/realtime-sync-types.ts`
- [x] 1.2 Define SyncEventDetails union (add/update/delete/conflict)
- [x] 1.3 Define SyncCompletedEvent for 'sync' emit payload
- [x] 1.4 Move RealtimeSyncOptions, RealtimeSyncStats to types file
- [x] 1.5 Update realtime-sync.ts to import from types file

## Task 2: Fix details?: any
- [x] 2.1 Replace `details?: any` with `details?: SyncEventDetails` in SyncEvent
- [x] 2.2 Ensure SyncEvent type remains backward compatible for consumers
- [x] 2.3 Type the 'sync' emit payload as SyncCompletedEvent

## Task 3: Add unit tests
- [x] 3.1 Create tests/sync/realtime-sync.test.ts
- [x] 3.2 Test: constructor, getStats, getQueueStatus, isActive
- [x] 3.3 Test: start/stop lifecycle, event emission (mocked deps)
- [x] 3.4 All tests pass

## Task 4: Verify
- [x] 4.1 `bun run typecheck` passes
- [x] 4.2 `bun run test:run` passes
- [x] 4.3 Update REFACTOR_CANDIDATES.md status to ✅
- [x] 4.4 Remove realtime-sync from Modules Without Tests
