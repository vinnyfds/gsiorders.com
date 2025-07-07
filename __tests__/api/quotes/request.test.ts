import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
};

// Mock the Supabase client creation
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Helper to mock product fetch with .select().in()
function mockProductFetch(products, error = null) {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue({ data: products, error })
    })
  };
}

// Helper to mock quote insert with .insert().select().single()
function mockQuoteInsert(quote, error = null) {
  return {
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: quote, error })
      })
    })
  };
}

describe('/api/quotes/request', () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset mock implementations
    mockSupabase.auth.getUser.mockReset();
    mockSupabase.from.mockReset();
  });

  describe('POST /api/quotes/request', () => {
    it('should create a quote request successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [
            { product_id: 'product-1', quantity: 2 },
            { product_id: 'product-2', quantity: 1 }
          ],
          company_name: 'Test Company',
          contact_email: 'test@example.com'
        }
      });

      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock product fetch
      const mockInsert = jest.fn();
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-quote-id' }],
          error: null
        })
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([
          { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 10 },
          { id: 'product-2', name: 'Test Product 2', price: 19.99, inventory_count: 5 }
        ]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.quote_id).toBe('test-quote-id');
      expect(data.total_value).toBe(79.97);
    });

    it('should return 405 for non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('method_not_allowed');
    });

    it('should return 401 when user is not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1 }]
        }
      });

      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('unauthorized');
      expect(data.message).toBe('Authentication required');
    });

    it('should return 400 for missing request body', async () => {
      const { req, res } = createMocks({
        method: 'POST'
      });

      // Always mock auth and from
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Request body is required');
    });

    it('should return 400 for empty items array', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [] }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('At least one item is required');
    });

    it('should return 400 for invalid product_id', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 123, quantity: 1 }]
        }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Item 1: product_id is required and must be a string');
    });

    it('should return 400 for invalid quantity', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 0 }]
        }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Item 1: quantity must be a number greater than 0');
    });

    it('should return 404 when product is not found', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [
            { product_id: 'product-1', quantity: 1 },
            { product_id: 'product-2', quantity: 1 }
          ]
        }
      });

      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock product fetch - only return one product, missing product-2
      const mockInsert = jest.fn();
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-quote-id' }],
          error: null
        })
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([
          { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 10 }
        ]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('not_found');
      expect(data.message).toBe('Product(s) not found: product-2');
    });

    it('should return 409 when product is out of stock', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 5 }]
        }
      });

      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock product fetch - product has insufficient inventory
      const mockInsert = jest.fn();
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-quote-id' }],
          error: null
        })
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([
          { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 3 }
        ]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('out_of_stock');
      expect(data.message).toBe('Only 3 units available for Test Product 1');
    });

    it('should return 500 when database error occurs during product fetch', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1 }]
        }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: null, error: new Error('Database connection failed') })
          })
        };
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('internal');
      expect(data.message).toBe('Database error while fetching products');
    });

    it('should return 500 when database error occurs during quote insertion', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1 }]
        }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([
          { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 10 }
        ]);
        if (table === 'quotes') return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: new Error('Quote insertion failed') })
            })
          })
        };
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('internal');
      expect(data.message).toBe('Database error while creating quote request');
    });

    it('should handle optional fields correctly', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1 }],
          company_name: 'Test Company',
          contact_email: 'test@example.com',
          phone: '123-456-7890',
          notes: 'Test notes'
        }
      });

      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock product fetch
      const mockInsert = jest.fn();
      mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-quote-id' }],
          error: null
        })
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([
          { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 10 }
        ]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.quote_id).toBe('test-quote-id');
    });

    it('should validate quantity maximum limit', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1000 }]
        }
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') return mockProductFetch([]);
        if (table === 'quotes') return mockQuoteInsert({ id: 'test-quote-id' });
        return mockProductFetch([]);
      });

      const { default: handler } = await import('../../../pages/api/quotes/request');
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Item 1: quantity cannot exceed 999');
    });
  });
}); 