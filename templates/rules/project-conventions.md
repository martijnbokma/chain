# Project Conventions

## MANDATORY: Single Source of Truth (SSOT)

**ALWAYS read `.chain/PROJECT.md` first before any other files or taking any actions.**

## MANDATORY: Rules Load Order

Apply rules in this exact order:

1. `.chain/PROJECT.md` (project SSOT)
2. `.chain/rules/user-preferences.md` (user-global defaults, copied into project)
3. `.chain/rules/project-conventions.md` (project-specific conventions)
4. Relevant workflow/skill files for the current task

Conflict handling:

- If user preferences conflict with project architecture or stack rules, follow `PROJECT.md`.
- If there is an explicit user request in the current task, follow that request.
- If a conflict is detected, state the applied rule and continue.

PROJECT.md is the Single Source of Truth for this project and contains:
- Complete project context and architecture
- Technology stack and build processes  
- Code conventions and development guidelines
- Project structure and key patterns

Reading PROJECT.md first ensures alignment with project conventions and prevents architectural violations.

## Package Manager
- **Always use `bun`** as the package manager. Never use `npm` or `pnpm`.
- Use `bun install` to install dependencies
- Use `bun run <script>` to run scripts
- Use `bun add <package>` to add dependencies

## Code Style
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused

## Error Handling
- Handle errors gracefully
- Never expose sensitive information in error messages

## Testing
- Write tests for new functionality
- Maintain existing test coverage
