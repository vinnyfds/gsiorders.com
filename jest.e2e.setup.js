// E2E Test Setup - Structure Validation
// This setup validates that all required components and APIs exist
// without requiring browser automation or real environment variables

// Mock fetch for API calls in tests
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: 'test-product-id' },
    pathname: '/products/test-product-id'
  })
}));

// Mock window.location for redirects (only if not already defined)
if (typeof window !== 'undefined' && window.location) {
  // Use assignment instead of defineProperty to avoid conflicts
  window.location.href = 'http://localhost:3000';
  window.location.assign = jest.fn();
  window.location.replace = jest.fn();
}

console.log('🧪 E2E Setup: Mock environment configured for structure validation'); 