# Workflow: Bug Fix

## Goal

Fix a reported bug using a failing-test-first approach so the fix is verified and regression-proof.

## Process

1. **Understand the Bug:** Gather the reported behavior, steps to reproduce, and expected vs actual outcome.
2. **Reproduce:** Confirm the bug in the current codebase. If you cannot reproduce, ask the user for more detail or environment info.
3. **Create Branch:** Create a branch named `fix/short-description` or `bugfix/issue-N`.
4. **Write Failing Test:** Add a test that reproduces the bug. The test must fail before the fix. Name it to describe the scenario.
5. **Root Cause:** Trace execution (logs, debugger, stack trace) to find the minimal cause.
6. **Implement Fix:** Make the smallest change that makes the test pass. Avoid unrelated changes.
7. **Verify:** Run the full test suite. Confirm the bug is resolved and no regressions.
8. **Commit:** Use conventional commit: `fix(scope): brief description`. Reference the issue if applicable.

## Output

- A passing test that would have caught the bug.
- A minimal code fix.
- A commit with a clear message.
