# Tasks: Refactor ai-integration.ts

> PRD: docs/prd-refactor-ai-integration.md

## Task 1: Extract types
- [x] 1.1 Create `src/sync/ai-integration-types.ts` with AIModelConfig, AIAnalysisResult, AIMergeResult
- [x] 1.2 Update ai-integration.ts to import from types file

## Task 2: Add unit tests
- [x] 2.1 Create `tests/sync/ai-integration.test.ts`
- [x] 2.2 Test: analyzeContent, performAIMerge, suggestImprovements, generateSummary, extractMetadata
- [x] 2.3 All tests pass

## Task 3: Verify
- [x] 3.1 `bun run typecheck` passes
- [x] 3.2 `bun run test:run` passes
- [x] 3.3 Update REFACTOR_CANDIDATES.md status to ✅
