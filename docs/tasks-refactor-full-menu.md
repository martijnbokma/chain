# Tasks: Refactor full-menu.ts

> PRD: docs/prd-refactor-full-menu.md

## Task 1: Move menuOptions to shared constants
- [x] 1.1 Add MENU_OPTIONS to src/shared/constants/menu.ts
- [x] 1.2 Move all menu option definitions (id, title, description, command, category, icon)
- [x] 1.3 Import MenuOption type in menu.ts
- [x] 1.4 Update full-menu.ts to import MENU_OPTIONS
- [x] 1.5 Replace menuOptions with MENU_OPTIONS throughout full-menu.ts

## Task 2: Add tests
- [x] 2.1 Create tests/shared/constants/menu.test.ts (or tests/cli/full-menu.test.ts)
- [x] 2.2 Test: MENU_OPTIONS has required structure (ids, categories, commands)
- [x] 2.3 Test: no duplicate ids, all categories valid
- [x] 2.4 All tests pass

## Task 3: Verify
- [x] 3.1 `bun run typecheck` passes
- [x] 3.2 `bun run test:run` passes
- [x] 3.3 Update REFACTOR_CANDIDATES.md status to ✅
- [x] 3.4 Remove full-menu from Modules Without Tests (or update)
