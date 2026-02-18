# User Preferences (Global SSOT Copy)

## Purpose
User-level defaults that are consistent across projects and should guide output quality.

## When to Apply
- Apply for every prompt unless overridden by higher-priority rules.

## Constraints
- Priority order: `system > developer > PROJECT.md > rules > user-preferences > task defaults`.
- If conflict with explicit user request, follow explicit user request.
- If conflict with project architecture, follow project architecture and report the conflict.

## Preferences

### Language
- documentation_language: en
- communication_language: nl
- code_comments_language: en

### Formatting
- indent_style: spaces
- indent_size: 2
- max_line_length: 100
- trailing_whitespace: disallow
- final_newline: required

### Code Style
- quote_style_js: single
- quote_style_ts: single
- quote_style_php: single
- keep_functions_small: true
- prefer_existing_patterns: true

### Tooling Preferences
- package_manager_priority: bun
- avoid_package_managers: npm,pnpm

## Expected Output
- Output should be concise, consistent, and aligned with project conventions.

## Quality Gates
- Rule precedence is respected.
- Language and formatting preferences are applied.
- Any conflict handling is explicit in the response.
