1. **Analyze the target code**: Review `SmoothSTT/lib/context-bridge.cjs` to understand the `getExePath` function logic.
2. **Create the test file**: Create `SmoothSTT/lib/context-bridge.test.cjs` using Node's native `test` and `assert` modules.
3. **Implement test cases**:
    - Scenario 1: `process.resourcesPath` is set and the executable exists at that path.
    - Scenario 2: `process.resourcesPath` is set but the executable does not exist (falls back to dev path).
    - Scenario 3: `process.resourcesPath` is not set (returns dev path).
4. **Mock dependencies**: Use `node:test` mocking capabilities (or manual mocks) for `process.resourcesPath` and `fs.accessSync`.
5. **Run the tests**: Execute the tests using `node SmoothSTT/lib/context-bridge.test.cjs`.
6. **Verify and Refine**: Ensure all tests pass and cover the intended logic.
7. **Complete pre-commit steps**: Ensure proper testing, verification, review, and reflection are done.
8. **Submit the change**: Submit the new test file with a descriptive commit message.
