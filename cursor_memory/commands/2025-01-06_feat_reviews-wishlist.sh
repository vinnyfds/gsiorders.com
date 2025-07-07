#!/bin/bash
# Command History for Reviews & Wishlist API Implementation
# Date: 2025-01-06
# Task: Complete Reviews and Wishlist APIs with ≥80% test coverage

# Initial coverage check
npx jest --coverage

# Run specific error coverage tests
npx jest --testPathPatterns="error-coverage.test.ts" --verbose

# Run tests with no cache to ensure fresh results
npx jest --testPathPatterns="error-coverage.test.ts" --no-cache

# Run tests with coverage focused on specific files
npx jest --testPathPatterns="error-coverage.test.ts" --coverage

# Run tests with verbose output for detailed coverage analysis
npx jest --testPathPatterns="error-coverage.test.ts" --coverage --verbose

# Final coverage run with expanded test suite
npx jest --testPathPatterns="error-coverage.test.ts" --coverage

# Final full suite coverage check
npx jest --coverage --no-cache

# Manual API testing commands (for reference)
# curl -X GET "http://localhost:3000/api/reviews?productId=test-product&page=1&limit=10"
# curl -X POST "http://localhost:3000/api/reviews" -H "Content-Type: application/json" -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" -d '{"productId":"test-product","rating":4,"comment":"Test review comment"}'
# curl -X GET "http://localhost:3000/api/wishlist?page=1&limit=10" -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000"
# curl -X POST "http://localhost:3000/api/wishlist" -H "Content-Type: application/json" -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" -d '{"productId":"test-product","action":"add"}' 