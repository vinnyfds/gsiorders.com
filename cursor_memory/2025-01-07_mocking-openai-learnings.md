# Mocking OpenAI & API Integrations – gsiorders.com

## 1. Mocking OpenAI in Next.js API Route Tests
- Use `jest.mock('openai')` at the top of the test file.
- For streaming APIs, mock the `OpenAI` class and its `chat.completions.create` method.
- Return a custom async generator for streaming responses.

**Example:**
```typescript
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation(async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world!' } }] };
        })
      }
    }
  }))
}));
```

## 2. Mocking Validation and Error Handling
- Match error messages in tests with actual implementation.
- If using Zod or similar, ensure test expects the same error structure as API returns.
- Use constants or helper functions for error messages in both implementation and tests.

## 3. Mocking Streaming Responses
- Use async generator functions to simulate streaming.
- In tests, collect all yielded chunks and assert the final output.

**Example:**
```typescript
const mockStream = async function* () {
  yield { choices: [{ delta: { content: 'A' } }] };
  yield { choices: [{ delta: { content: 'B' } }] };
};
```

## 4. General Mocking Best Practices
- Reset mocks between tests with `jest.resetAllMocks()` in `beforeEach`.
- Mock only what you need; over-mocking can hide real integration issues.
- Test both success and error paths (API errors, validation failures, rate limits).

## 5. Common Pitfalls & Solutions
- **Pitfall:** Mocked method signature does not match actual usage (e.g., missing async generator).
  - **Solution:** Always check the real API signature and usage in the implementation.
- **Pitfall:** Error message mismatch between implementation and test.
  - **Solution:** Use shared constants or import error messages from the implementation.

## 6. Learnings for Future Contributors
- Always align test mocks with the latest implementation.
- Document any changes to API response structure in both code and tests.
- Prefer integration tests for critical API flows, but use unit mocks for external APIs.
- For streaming APIs, test both chunked and full responses.
- Keep Postman collections up-to-date for manual verification. 