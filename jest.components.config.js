module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/components/**/*.test.ts',
    '**/__tests__/components/**/*.test.tsx'
  ],
  transform: {
    '^.+\\\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
}; 