# Refactoring PRD: src/sync/realtime-sync.ts

> Target: src/sync/realtime-sync.ts  
> Lines: 342 | Tech Debt: 4 | Impact: 3 | Risk: 4 | Complexity: 2 | Score: 13

## Executive Summary

`RealtimeSyncEngine` provides real-time file watching and synchronization. The refactor aims to fix the architectural violation (`details?: any` in SyncEvent) and add unit tests for better maintainability.

## Current State

### Responsibilities
1. File watching (source + target dirs)
2. Debounced file change handling
3. Smart sync orchestration per change
4. Stats reporting
5. Initial sync on start

### Issues
- **Architectural violation**: `details?: any` in SyncEvent interface (LOW severity)
- **SyncEvent vs actual events**: SyncEvent defines type 'add'|'update'|'delete'|'conflict' but engine emits 'sync' with different shape
- **Missing tests**: No unit tests for RealtimeSyncEngine

## Target State

### Type Safety
- Replace `details?: any` with a discriminated union based on event type
- Add typed event payload for the actual 'sync' event (filePath, duration, result)
- Export event types for consumers

### Testability
- Add `tests/sync/realtime-sync.test.ts` for RealtimeSyncEngine
- Test: start/stop, getStats, getQueueStatus, isActive
- Test: event emission (started, stopped, sync, initial-sync)
- Mock SmartSyncEngine, ContentRegistry, SmartFileWatcher where needed

## Scope

### In Scope
- Extract types to `src/sync/realtime-sync-types.ts`
- Replace `details?: any` with proper union (SyncEventDetails)
- Add typed SyncCompletedEvent for 'sync' emit
- Add unit tests
- Preserve public API

### Out of Scope
- Changing CLI consumers (realtime-sync.ts)
- Modifying SmartSyncEngine, ContentRegistry, SmartFileWatcher interfaces
- Adding integration/E2E tests

## Success Criteria
- [ ] No `any` types in realtime-sync module
- [ ] SyncEvent and event payloads properly typed
- [ ] Unit tests for RealtimeSyncEngine
- [ ] All existing tests pass
- [ ] Public API unchanged (backward compatible)
