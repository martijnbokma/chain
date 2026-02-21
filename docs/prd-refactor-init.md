# Refactoring PRD: src/cli/init.ts

> Target: src/cli/init.ts  
> Lines: 340 | Tech Debt: 2 | Impact: 3 | Risk: 2 | Complexity: 2 | Score: 9

## Executive Summary

`init.ts` handles project initialization and shared content hub setup. The refactor fixes the `as any` cast when passing config to `analyzeProject` and ensures tests cover the main flows.

## Current State

### Responsibilities
1. runInit (main entry)
2. setupSharedContentHub
3. copyTemplates
4. Config creation, content dirs, example files, PROJECT.md generation, sync

### Issues
- **Type safety**: `finalConfig as any` on line 277 when calling analyzeProject
- finalConfig is `Record<string, unknown>` from setup; analyzeProject expects `ToolkitConfig | undefined`

### Strengths
- init.test.ts exists with 4 tests (skip when initialized, quick setup, example rule, re-init with force)

## Target State

### Type Safety
- Replace `finalConfig as any` with proper type
- finalConfig from runQuickSetup/runAdvancedSetup conforms to chain.yaml schema
- Use `finalConfig as ToolkitConfig` (setup produces valid config shape)

### Testability
- Existing tests remain; verify they pass after type fix
- Optionally add test for setupSharedContentHub (--shared flow)

## Scope

### In Scope
- Fix `as any` cast
- Preserve public API
- Ensure existing tests pass

### Out of Scope
- Changing runQuickSetup/runAdvancedSetup return types
- Adding E2E tests for full init flow

## Success Criteria
- [ ] No `any` types in init.ts
- [ ] All existing tests pass
- [ ] Public API unchanged
