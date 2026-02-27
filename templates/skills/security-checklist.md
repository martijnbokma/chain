# Security Checklist

Review and harden code for common security vulnerabilities before merging or deploying.

## When

Use this skill when:
- The user asks for a security review.
- Adding authentication, authorization, or user input handling.
- Before a release or security-sensitive merge.
- The user asks: "security check", "audit", "vulnerabilities".

## How

### 1. Secrets & Credentials
- [ ] No hardcoded API keys, passwords, or tokens.
- [ ] Secrets in environment variables or secret manager.
- [ ] No secrets in logs, error messages, or client-side code.
- [ ] `.env` and `.env.local` in `.gitignore`.

### 2. Input Validation

- [ ] All user input validated and sanitized.
- [ ] File uploads: type, size, and content validated.
- [ ] URL parameters and query strings validated.
- [ ] No raw user input in SQL, shell commands, or eval.

### 3. Database & Injection

- [ ] Parameterized queries (no string concatenation).
- [ ] ORM used correctly (no raw SQL with user input).
- [ ] Least privilege: DB user has minimal required permissions.

### 4. Authentication & Authorization

- [ ] Authentication required for protected routes.
- [ ] Authorization checks on every sensitive operation.
- [ ] No IDOR: users cannot access other users' data by ID manipulation.
- [ ] Session/token handling: secure, httpOnly, sameSite.

### 5. Output & Data Exposure

- [ ] Sensitive data not in error messages.
- [ ] Stack traces disabled in production.
- [ ] PII masked or excluded from logs.

### 6. Dependencies

- [ ] Dependencies up to date (security patches).
- [ ] `npm audit` / `bun audit` / equivalent run.
- [ ] No known vulnerable packages in lockfile.

## Report Format

```markdown
## Security Review Summary

### Critical (Must Fix)
- [Issue with location and fix]

### Important (Should Fix)
- [Issue with recommendation]

### Minor (Consider)
- [Suggestion]
```

## Constraints

- Do not assume — verify each item.
- Be specific: file, line, and suggested fix.
- Prioritize by severity and exploitability.
