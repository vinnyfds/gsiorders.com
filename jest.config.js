/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",                 // transpile TS in-memory
  testEnvironment: "node",           // no jsdom needed
  testMatch: ["**/__tests__/api/*.spec.ts"],

  collectCoverage: true,
  collectCoverageFrom: ["pages/api/{reviews,wishlist,health}.ts"],
  coverageThreshold: {
    "pages/api/reviews.ts":  { statements: 80, branches: 80 },
    "pages/api/wishlist.ts": { statements: 80, branches: 80 },
    "pages/api/health.ts":   { statements: 80, branches: 80 }
  }
}; 