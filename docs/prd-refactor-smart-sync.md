# Refactoring PRD: src/sync/smart-sync.ts

> Target: src/sync/smart-sync.ts  
> Lines: 511 | Tech Debt: 3 | Impact: 5 | Risk: 4 | Complexity: 3 | Score: 15

## Executive Summary

`SmartSyncEngine` is a critical module (5 dependents) that handles content hashing, directory comparison, conflict detection, and sync orchestration. The refactor aims to improve maintainability, type safety, and testability by extracting sub-modules, removing `any` types, and reducing nesting.

## Current State

### Responsibilities (Violation: Too Many)
1. Content hashing
2. Directory scanning
3. Directory comparison (add/update/remove/conflict detection)
4. Sync orchestration (additions, updates, removals)
5. Conflict resolution (AI + fallback)
6. Metadata persistence
7. Registry integration
8. Safe file removal with backup

### Issues
- **Type safety**: 4× `as any` casts (lines 337, 341, 342, 348, 349)
- **Deep nesting**: 6+ levels in conflict resolution block
- **Testability**: No unit tests; tightly coupled to AIConflictResolver, ContentRegistry, PerformanceOptimizer
- **Single class**: 511 lines; hard to reason about

## Target State

### Module Structure
```
src/sync/
├── smart-sync/
│   ├── index.ts          # SmartSyncEngine (orchestrator, ~150 lines)
│   ├── directory-comparator.ts   # compareDirectories, scanDirectory (~120 lines)
│   ├── sync-executor.ts          # Process add/update/remove/conflict (~100 lines)
│   └── types.ts                  # ContentHash, SyncContentMetadata, SmartSyncResult
├── smart-sync.ts         # Re-export for backward compatibility
```

### Type Safety
- Replace all `as any` with proper types from `AIConflictResolver` and `ai-conflict-resolver`
- Ensure `ConflictDetails` and merge result types are imported and used

### Testability
- Add `smart-sync/directory-comparator.test.ts`
- Add `smart-sync/sync-executor.test.ts` (or integration test for SmartSyncEngine)

## Scope

### In Scope
- Extract directory comparison logic
- Extract sync execution (add/update/remove) logic
- Fix `any` types
- Reduce nesting via early returns and extracted functions
- Add unit tests for extracted modules
- Preserve public API (SmartSyncEngine constructor and methods)

### Out of Scope
- Changing ContentRegistry, AIConflictResolver, or PerformanceOptimizer interfaces
- Modifying CLI consumers (smart-sync.ts, performance.ts, resolve-conflicts.ts)
- Changing metadata file format (.chain/smart-sync-metadata.json)

## Success Criteria
- [ ] No `any` types in smart-sync module
- [ ] Max nesting depth ≤ 4
- [ ] Extracted modules have unit tests
- [ ] All existing tests pass
- [ ] Public API unchanged (backward compatible)
