# Refactoring PRD: src/sync/context-generator.ts

> Target: src/sync/context-generator.ts  
> Lines: 503 | Tech Debt: 2 | Impact: 3 | Risk: 2 | Complexity: 2 | Score: 9

## Executive Summary

`context-generator.ts` produces PROJECT.md from project analysis. The module is well-structured with pure functions but lacks unit tests. The refactor adds tests for the main entry point and key output sections.

## Current State

### Responsibilities
1. generateRichProjectContext (main entry)
2. Section generators: header, overview, tech stack, architecture, structure, conventions, patterns, database, development, testing, important files, AI agent notes
3. Helpers: getVersion, getSubdirPurpose, getDirectoryPurpose, renderTree

### Strengths
- Pure functions, no side effects
- Uses ProjectAnalysis from analyzers (typed)
- No `any` types

### Issues
- **Missing tests**: No unit tests; used by generate-context CLI and init

## Target State

### Testability
- Add `tests/sync/context-generator.test.ts`
- Test: generateRichProjectContext with minimal ProjectAnalysis
- Test: output contains expected sections (header, overview, etc.)
- Test: database section only when analysis.database present
- Test: testing section only when hasTestFiles

## Scope

### In Scope
- Add unit tests for generateRichProjectContext
- Preserve public API

### Out of Scope
- Extracting types (ProjectAnalysis from analyzers)
- Splitting into sub-modules
- Changing output format

## Success Criteria
- [ ] Unit tests cover main code paths
- [ ] All existing tests pass
- [ ] Public API unchanged
