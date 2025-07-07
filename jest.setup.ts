import '@testing-library/jest-dom';

// Create a proper chainable mock for Supabase
const createChainableMock = () => {
  const mock = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    upsert: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis()
  };

  // Make all methods return the mock object for chaining
  Object.keys(mock).forEach(key => {
    if (key !== 'single' && typeof mock[key] === 'function') {
      mock[key].mockReturnValue(mock);
    }
  });

  return mock;
};

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClient = createChainableMock();
  return {
    createClient: jest.fn(() => mockClient),
    mockSupabaseClient: mockClient
  };
});

// Mock Next.js navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 