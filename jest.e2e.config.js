module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/integration/**/*.e2e.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.e2e.setup.js'],
  testTimeout: 30000,
  // Mock environment variables for E2E tests
  setupFiles: ['<rootDir>/jest.e2e.env.js'],
}; 