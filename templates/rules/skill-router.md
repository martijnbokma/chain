# Skill Router

Before responding to any user request, determine which skill(s) and/or specialist(s) are relevant based on the request content. Load and follow them throughout the conversation.

## Routing Table

| Trigger pattern                                | Skill / Specialist                          |
|------------------------------------------------|---------------------------------------------|
| "review", "check this code", "feedback"        | code-review                                 |
| "debug", "fix", "broken", "error", "failing"   | debug-assistant                             |
| "refactor", "cleanup", "restructure"           | refactor + start-refactor workflow          |
| "find tech debt", "refactor candidates"        | finding-refactor-candidates                 |
| "build", "implement", "create feature"         | implementation-loop workflow                |
| CSS, styling, Tailwind, classes, design tokens | tailwind-specialist                         |
| SQL, migration, schema, RLS, database, Supabase query | database-specialist                  |
| types, interfaces, generics, TypeScript        | typescript-specialist                       |
| accessibility, a11y, screen reader, ARIA       | accessibility-specialist                    |
| API design, endpoints, REST, Edge Functions    | api-designer                                |
| tests, testing, coverage, e2e, Vitest, Playwright | qa-tester                                |
| performance, slow, optimize, bundle, lazy load | performance-specialist                      |
| security, auth, XSS, CSRF, RLS policies       | security-specialist                         |
| UI, layout, component design, visual           | ui-designer + frontend-developer            |
| UX, user flow, usability, interaction          | ux-designer                                 |
| deploy, Docker, CI/CD, infra, Dokploy          | devops-engineer                             |
| documentation, README, guide, changelog        | technical-writer                            |
| responsive, mobile, breakpoints                | verifying-responsiveness                    |
| backend, server, Edge Functions, Supabase functions | backend-developer                      |
| fullstack, end-to-end feature                  | fullstack-developer                         |
| CSS architecture, specificity, selectors       | css-specialist                              |

## Rules

- **Multiple skills can be active simultaneously.** For example, "refactor a Supabase migration" activates both the `refactor` skill and the `database-specialist`.
- **Specialists provide the mindset and standards; skills provide the workflow.** Combine them when both apply.
- **When uncertain, state which skill you are applying and why** so the user can correct the routing.
- **Workflows take precedence** when explicitly invoked (e.g., "using the start-refactor workflow").
- **File context matters.** If the user references a file, use its type to inform routing:
  - `.sql` / `supabase/` → database-specialist
  - `.css` / `index.css` / Tailwind classes → tailwind-specialist + css-specialist
  - `.test.ts` / `.spec.ts` / `e2e/` → qa-tester
  - `.tsx` components → frontend-developer (+ ui-designer if layout/visual)
  - `services/` → backend-developer (+ database-specialist if Supabase queries)
