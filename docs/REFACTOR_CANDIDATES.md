# Refactor Candidates

> Generated: 2026-02-21

## Priority Matrix

| # | File | Lines | Tech Debt | Impact | Risk | Complexity | Score | Priority | Status |
|---|------|-------|-----------|--------|------|------------|-------|----------|--------|
| 1 | src/cli/full-menu.ts | 548 | 4 | 2 | 3 | 2 | 11 | HIGH | ✅ |
| 2 | src/sync/smart-sync.ts | 511 | 3 | 5 | 4 | 3 | 15 | CRITICAL | ✅ |
| 3 | src/sync/ai-integration.ts | 526 | 3 | 3 | 4 | 2 | 12 | HIGH | ✅ |
| 4 | src/sync/content-registry.ts | 460 | 3 | 5 | 4 | 2 | 14 | CRITICAL | ✅ |
| 5 | src/sync/context-generator.ts | 503 | 2 | 3 | 2 | 2 | 9 | MEDIUM | ✅ |
| 6 | src/sync/performance-optimizer.ts | 395 | 3 | 4 | 4 | 2 | 13 | HIGH | ✅ |
| 7 | src/sync/realtime-sync.ts | 342 | 4 | 3 | 4 | 2 | 13 | HIGH | ✅ |
| 8 | src/sync/ai-conflict-resolver.ts | 316 | 3 | 3 | 4 | 2 | 12 | HIGH | ✅ |
| 9 | src/cli/init.ts | 340 | 2 | 3 | 2 | 2 | 9 | MEDIUM | ✅ |
| 10 | src/sync/analyzers/structure-analyzer.ts | 357 | 2 | 2 | 2 | 2 | 8 | MEDIUM | ✅ |

## Architectural Violations

| File | Issue | Severity |
|------|-------|----------|
| src/sync/smart-sync.ts | Deep nesting (6+ levels); multiple responsibilities | MEDIUM |
| src/cli/doctor.ts | Deep nesting (6+ levels) | LOW |

## Missing Test Coverage

### Modules Without Tests
- ai-integration.ts (src/sync)
- smart-sync.ts (src/sync)
- content-registry.ts (src/sync)
- registry.ts (src/cli)
- improve-prompts.ts (src/cli)
- performance.ts (src/cli)
- doctor.ts (src/cli)
- error-handler.ts (src/utils)
- templates-sync.ts (src/sync)
- conflict-resolver.ts (src/sync)
- realtime-sync.ts (src/cli)

## Statistics

- **Total Source Files**: 85
- **Any-type Occurrences**: 1
- **Architectural Violations**: 4
- **Files > 300 lines**: 10
- **Files > 400 lines**: 6
- **TODOs/FIXMEs**: 0
- **Hardcoded hex colors**: 0

## Phase 1 Recommendations

1. **src/sync/smart-sync.ts** — Extract sub-modules (hashing, conflict detection, sync orchestration); reduce nesting; add unit tests. High impact (5 dependents).

2. **src/sync/content-registry.ts** — Add unit tests; consider splitting metadata vs. relationship logic. High impact (4 dependents).

3. **src/cli/full-menu.ts** — Move `menuOptions` to `src/shared/constants/menu.ts` (MENU_OPTIONS); reduce file size; improve SSOT.

4. **src/sync/realtime-sync.ts** — Replace `details?: any` with a proper union type; add tests.

5. **src/sync/ai-integration.ts** — Add tests; consider extracting prompt builders and response parsers into separate modules.

## Next Steps (Per-File Refactor Pipeline)

Process files in order of priority score (highest first). Complete the full pipeline for one file before starting the next:

1. **Generate Refactoring PRD** → `docs/prd-refactor-[filename].md`
2. **Generate Task List** → `docs/tasks-refactor-[filename].md`
3. **Execute Tasks** — Work through the task list
4. **Update Status** — Mark ✅ in Priority Matrix

### Interaction Flow

> "I have identified 10 refactor candidates. Shall I start with the first file (`src/sync/smart-sync.ts`)? I will generate a Refactoring PRD and task list for it."
