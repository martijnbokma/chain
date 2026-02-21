# Tasks: Refactor context-generator.ts

> PRD: docs/prd-refactor-context-generator.md

## Task 1: Add unit tests
- [x] 1.1 Create tests/sync/context-generator.test.ts
- [x] 1.2 Build minimal ProjectAnalysis fixture
- [x] 1.3 Test: generateRichProjectContext returns non-empty string
- [x] 1.4 Test: output contains expected sections (Overview, Technology Stack, etc.)
- [x] 1.5 Test: database section when analysis.database present
- [x] 1.6 Test: testing section when hasTestFiles
- [x] 1.7 All tests pass

## Task 2: Verify
- [x] 2.1 `bun run typecheck` passes
- [x] 2.2 `bun run test:run` passes
- [x] 2.3 Update REFACTOR_CANDIDATES.md status to ✅
