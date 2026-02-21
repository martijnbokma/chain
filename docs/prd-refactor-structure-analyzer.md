# Refactoring PRD: src/sync/analyzers/structure-analyzer.ts

> Target: src/sync/analyzers/structure-analyzer.ts  
> Lines: 357 | Tech Debt: 2 | Impact: 2 | Risk: 2 | Complexity: 2 | Score: 8

## Executive Summary

`structure-analyzer.ts` analyzes project structure (features, shared dir, contexts, etc.). The module is well-typed with no `any` but lacks unit tests. The refactor adds tests for the main entry point and key detection logic.

## Current State

### Responsibilities
1. analyzeStructure (main entry)
2. buildDirectoryTree, detectFeatures, detectComponentNaming
3. collectFileNames, detectI18n
4. listDir, countFiles (helpers)

### Strengths
- Well-defined interfaces: DirectoryNode, FeatureInfo, ArchitectureInfo, ArchitecturePatterns
- No `any` types
- Pure logic + file I/O

### Issues
- **Missing tests**: No unit tests; used by analyzeProject (context generation, init)

## Target State

### Testability
- Add `tests/sync/analyzers/structure-analyzer.test.ts`
- Test: analyzeStructure with minimal project (no src)
- Test: analyzeStructure with src/ structure
- Test: feature-based detection (src/features/)
- Test: config files detection
- Test: directory tree structure

## Scope

### In Scope
- Add unit tests for analyzeStructure
- Preserve public API

### Out of Scope
- Extracting types (already in file)
- Splitting into sub-modules

## Success Criteria
- [ ] Unit tests cover main code paths
- [ ] All existing tests pass
- [ ] Public API unchanged
