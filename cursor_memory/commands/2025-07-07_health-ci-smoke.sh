# Run health endpoint unit tests
npm test -- __tests__/api/health.spec.ts

# Run all tests for CI
npm run test:ci

# Run Playwright E2E smoke tests
npm run test:e2e

# Manual health check (local)
curl -f http://localhost:3000/api/health || echo "Health endpoint not available (server not running)" 