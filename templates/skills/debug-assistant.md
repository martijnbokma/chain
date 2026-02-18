# Debug Assistant

Systematically debug issues by identifying root causes, not just symptoms.

## Purpose

To systematically identify and resolve software issues by finding root causes rather than treating symptoms, ensuring comprehensive and lasting solutions.

## When to Use

- The user reports a bug or unexpected behavior
- An error message appears during development
- Tests are failing unexpectedly
- The user asks: "debug", "fix this", "why is this broken", "what's wrong"
- Performance issues need investigation
- Complex issues require systematic analysis

## Constraints

- Always identify root cause before implementing fixes
- Use minimal changes that address the core issue
- Add regression tests to prevent future occurrences
- Verify fixes don't introduce new issues
- Document findings for future reference
- Never apply fixes without understanding the problem
- Preserve existing behavior except for the bug being fixed

## Expected Output

- Clear identification of root cause vs symptoms
- Minimal, targeted fixes that address core issues
- Regression tests to prevent future occurrences
- Verification that fixes work and don't break other functionality
- Documentation of the debugging process and findings
- Prevention strategies for similar issues

## How

### 1. Reproduce the Issue
- Confirm the exact steps to reproduce the problem.
- Note the expected vs actual behavior.
- Identify the environment (browser, Node version, OS).

### 2. Gather Evidence
- Read error messages and stack traces carefully.
- Check relevant log output.
- Identify the last known working state (what changed?).

### 3. Isolate the Root Cause
- **Binary search**: Narrow down the problem area by halving the search space.
- **Minimal reproduction**: Strip away unrelated code until only the bug remains.
- **Check assumptions**: Verify inputs, types, and state at each step.
- **Dependency check**: Has a dependency been updated? Check `package.json` and lock files.

### 4. Fix Strategy
- **Upstream fix**: Fix the root cause, not the symptom.
- **Minimal change**: Prefer single-line fixes over large refactors.
- **Regression test**: Add a test that would have caught this bug.
- **No side effects**: Ensure the fix doesn't break other functionality.

### 5. Verify
Run the project's verification toolchain:
- Typecheck passes
- Linter passes
- All tests pass (including the new regression test)
- Manual verification of the original issue

## Output Format

```markdown
## Bug Analysis

**Symptom:** [What the user sees]
**Root Cause:** [Why it happens]
**Fix:** [What was changed]
**Regression Test:** [Test added to prevent recurrence]
**Verification:** [Commands run to verify the fix]
```

## Key Rules
- **Root cause first**: Never patch symptoms without understanding the cause.
- **One fix at a time**: Don't bundle unrelated changes with the bug fix.
- **Explain the why**: Help the user understand what went wrong and how to prevent it.
- **Preserve behavior**: A bug fix should not change unrelated functionality.
