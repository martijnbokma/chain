# Bug Fix

Fix bugs using a failing-test-first approach to ensure the fix is correct and regression-proof.

## When

Use this skill when:
- The user reports a bug or unexpected behavior.
- A test is failing.
- The user asks: "fix this bug", "debug", "why does X happen".

## How

### 1. Reproduce

- Understand the reported behavior.
- Identify steps to reproduce.
- Confirm the bug in the current codebase.

### 2. Write a Failing Test

- Add a test that reproduces the bug.
- The test must fail before the fix.
- Name the test to describe the bug or scenario.

### 3. Root Cause

- Trace execution (logs, debugger, stack trace).
- Identify the minimal change that fixes the bug.
- Avoid unrelated changes.

### 4. Implement Fix

- Make the minimal change to pass the test.
- Ensure no existing tests break.
- Run the full test suite.

### 5. Verify

- Confirm the new test passes.
- Confirm the bug is resolved.
- Check for similar patterns elsewhere.

## Report Format (optional)

```markdown
## Bug Fix Summary

**Issue**: [Brief description]
**Root cause**: [What was wrong]
**Fix**: [What changed]
**Tests**: [New/updated tests]
```

## Constraints

- Always add or update a test that would have caught the bug.
- Prefer small, focused fixes over large refactors.
- Document non-obvious fixes with a brief comment.
