# Refactoring PRD: src/cli/full-menu.ts

> Target: src/cli/full-menu.ts  
> Lines: 548 | Tech Debt: 4 | Impact: 2 | Risk: 3 | Complexity: 2 | Score: 11

## Executive Summary

`full-menu.ts` contains ~280 lines of inline `menuOptions` that should live in shared constants (SSOT). The refactor moves menu options to `src/shared/constants/menu.ts` and adds tests for the menu structure.

## Current State

### Architectural Violation
- **menuOptions (280+ lines) inline** — Should be in shared constants (SSOT)
- MENU_CATEGORIES and MENU_ICONS already live in `src/shared/constants/menu.ts`
- full-menu.ts duplicates menu data that could be reused (e.g. help, docs)

### Structure
- menuOptions: 40+ entries with id, title, description, command, category, icon
- groupOptionsByCategory, displayMainMenu, displayCategoryMenu, etc.
- Interactive flow with @clack/prompts (select, confirm, text)

## Target State

### SSOT for Menu Data
- Add `MENU_OPTIONS` to `src/shared/constants/menu.ts`
- Move all menu option definitions from full-menu.ts
- full-menu.ts imports MENU_OPTIONS and uses it
- Single source of truth for menu structure

### Testability
- Add tests for MENU_OPTIONS structure (required fields, valid categories, no duplicate ids)
- Optionally: test groupOptionsByCategory logic (extract to shared util if needed)

## Scope

### In Scope
- Move menuOptions to MENU_OPTIONS in shared/constants/menu.ts
- Update full-menu.ts to import and use MENU_OPTIONS
- Add tests for menu constants
- Preserve public API (fullMenuCommand, runFullMenu behavior)

### Out of Scope
- Changing interactive flow or @clack/prompts usage
- Adding E2E tests for full menu interaction
- Modifying quickActions (could be derived from MENU_OPTIONS later)

## Success Criteria
- [ ] MENU_OPTIONS in shared/constants/menu.ts
- [ ] full-menu.ts reduced by ~270 lines
- [ ] Tests for menu structure
- [ ] All existing tests pass
- [ ] Menu behavior unchanged
