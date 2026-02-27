# Write Tests

Write tests for new or existing code using a Test-Driven Development (TDD) approach when appropriate.

## When

Use this skill when:
- The user asks to add tests for a feature or function.
- Implementing new functionality (TDD: write failing test first).
- Coverage gaps are identified.
- The user asks: "add tests", "write tests", "test this", "TDD".

## How

### 1. Understand the Scope
- What is being tested? (function, component, API endpoint)
- What is the project's test framework? (Vitest, Jest, pytest, etc.)
- Where do tests live? (e.g. `tests/`, `__tests__/`, `*.test.ts`)

### 2. TDD Flow (for new features)
1. **Red**: Write a failing test that describes the expected behavior.
2. **Green**: Implement the minimum code to make the test pass.
3. **Refactor**: Improve the implementation while keeping tests green.

### 3. Test Structure
- **Arrange**: Set up test data and preconditions.
- **Act**: Execute the code under test.
- **Assert**: Verify the outcome.

### 4. What to Test
- Happy path (normal inputs, expected outputs).
- Edge cases (empty, null, boundary values).
- Error cases (invalid input, failure modes).
- Integration points (mocked dependencies).

### 5. Avoid
- Tests that only assert implementation details.
- Brittle tests that break on refactoring.
- Tests without clear intent (meaningful descriptions).

## Constraints

- Use the project's existing test framework and patterns.
- Match the project's test file location and naming.
- Keep tests fast and isolated (mock external dependencies).
- One logical assertion per test when possible.

## Expected Output

- Tests that document and verify behavior.
- Clear test names that describe the scenario.
- Tests that fail when the behavior breaks.
