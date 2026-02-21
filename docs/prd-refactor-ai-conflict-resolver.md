# Refactoring PRD: src/sync/ai-conflict-resolver.ts

> Target: src/sync/ai-conflict-resolver.ts  
> Lines: 316 | Tech Debt: 3 | Impact: 3 | Risk: 4 | Complexity: 2 | Score: 12

## Executive Summary

`AIConflictResolver` handles AI-powered conflict resolution with 3-way merge. The module is well-typed but lacks unit tests. The refactor aims to extract types for consistency and add comprehensive tests.

## Current State

### Responsibilities
1. Conflict detection (detectConflict)
2. AI-assisted 3-way merge (performAIMerge)
3. Merge strategies: both-modified, content-conflict, structural-conflict
4. Interactive resolution (resolveInteractively)
5. Batch resolution (resolveBatchConflicts)

### Strengths
- Well-defined interfaces: ConflictDetails, MergeResult, ConflictResolutionOptions
- No `any` types
- Clear separation of merge strategies

### Issues
- **Missing tests**: No unit tests; used by smart-sync and resolve-conflicts CLI
- **Types inline**: Types defined in same file (extract for consistency with other sync modules)

## Target State

### Type Extraction
- Create `src/sync/ai-conflict-resolver-types.ts`
- Move ConflictDetails, MergeResult, ConflictResolutionOptions
- Re-export from ai-conflict-resolver.ts for backward compatibility

### Testability
- Add `tests/sync/ai-conflict-resolver.test.ts`
- Test: detectConflict (both-modified, content-conflict, structural-conflict)
- Test: performAIMerge for each change type
- Test: resolveBatchConflicts
- Test: mergeBothModified 3-way merge logic
- Mock file I/O where needed

## Scope

### In Scope
- Extract types to separate file
- Add unit tests for AIConflictResolver
- Preserve public API

### Out of Scope
- Changing merge algorithms
- Integrating with AIIntegration for actual AI calls
- Modifying smart-sync or resolve-conflicts consumers

## Success Criteria
- [ ] Types in ai-conflict-resolver-types.ts
- [ ] Unit tests cover main code paths
- [ ] All existing tests pass
- [ ] Public API unchanged (backward compatible)
