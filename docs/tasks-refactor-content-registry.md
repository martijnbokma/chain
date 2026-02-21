# Tasks: Refactor content-registry.ts

> PRD: docs/prd-refactor-content-registry.md

## Task 1: Extract types
- [x] 1.1 Create `src/sync/content-registry-types.ts` with ContentMetadata, RegistryStats, ContentRelationship
- [x] 1.2 Update content-registry.ts to import from types file

## Task 2: Add unit tests
- [x] 2.1 Create `tests/sync/content-registry.test.ts`
- [x] 2.2 Test: load/initialize, registerContent, getContent, getContentByPath, findContent, getStats, persist
- [x] 2.3 All tests pass

## Task 3: Verify
- [x] 3.1 `bun run typecheck` passes
- [x] 3.2 `bun run test:run` passes
- [x] 3.3 Update REFACTOR_CANDIDATES.md status to ✅
