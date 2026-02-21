# Refactoring PRD: src/sync/content-registry.ts

> Target: src/sync/content-registry.ts  
> Lines: 460 | Tech Debt: 3 | Impact: 5 | Risk: 4 | Complexity: 2 | Score: 14

## Executive Summary

`ContentRegistry` is a critical module (4 dependents) for centralized content management. The refactor aims to improve testability and maintainability by extracting types and adding unit tests.

## Current State

### Responsibilities
1. Load/save registry from disk
2. Register content with metadata
3. Query content (by ID, path, type, category, tags)
4. Statistics and conflict/orphan detection
5. Dependency graph and relationship management
6. Sync status updates
7. Registry optimization

### Issues
- No unit tests
- Types inline in file (could be extracted for reuse)
- Single large class (460 lines)

## Target State

### Changes
1. Extract types to `content-registry-types.ts`
2. Add unit tests for core operations (load, register, find, getStats)
3. Keep ContentRegistry as single class (splitting metadata vs relationships adds complexity without clear benefit for current size)

## Scope

### In Scope
- Extract ContentMetadata, RegistryStats, ContentRelationship to types file
- Add unit tests for registerContent, getContent, findContent, getStats, load/save
- Preserve public API

### Out of Scope
- Changing ContentRegistry interface
- Modifying dependents (smart-sync, realtime-sync, registry CLI, performance CLI)

## Success Criteria
- [ ] Types in dedicated file
- [ ] Unit tests cover register, get, find, stats, load
- [ ] All existing tests pass
- [ ] Public API unchanged
