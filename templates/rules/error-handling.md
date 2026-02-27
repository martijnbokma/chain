# Error Handling

Handle errors gracefully so the application fails safely and provides useful feedback.

## Principles

- **Fail fast**: Surface errors early rather than propagating invalid state.
- **User-facing**: Show clear, actionable messages; never expose internals.
- **Logging**: Log enough context for debugging without leaking secrets.

## Rules

### 1. Error Messages

- Be specific: "Invalid email format" not "Invalid input".
- Be actionable: "Set API_KEY in .env" not "Missing config".
- Never expose stack traces, paths, or internal details to users.

### 2. Config and Startup

- Validate config at startup.
- Exit with a clear message if required config is missing.
- Do not crash silently; log the reason before exiting.

### 3. User Input

- Validate before processing.
- Return validation errors with field-level detail when possible.
- Do not throw on invalid input; return structured errors.

### 4. External Services

- Handle timeouts and network failures.
- Retry with backoff where appropriate.
- Degrade gracefully when a dependency is unavailable.

### 5. Logging

- Log errors with context (operation, input summary, error).
- Do not log secrets, tokens, or PII.
- Use appropriate log levels (error, warn, info).
