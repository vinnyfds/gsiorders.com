import { createMocks } from 'node-mocks-http';

// Mock Supabase client
let mockSupabase: any;

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockSupabase,
}));

describe('/api/quotes/request', () => {
  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          in: jest.fn(() => ({
            data: [
              { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 100 },
              { id: 'product-2', name: 'Test Product 2', price: 49.99, inventory_count: 50 }
            ],
            error: null
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'test-quote-id' },
              error: null
            }))
          }))
        }))
      }))
    };
    jest.clearAllMocks();
    
    // Default successful auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  describe('POST /api/quotes/request', () => {
    it('should create a quote request successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [
            { product_id: 'product-1', quantity: 5 },
            { product_id: 'product-2', quantity: 3 }
          ],
          company_name: 'Test Company',
          contact_name: 'John Doe',
          contact_email: 'john@test.com'
        }
      });

      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.quote_id).toBe('test-quote-id');
      expect(data.message).toBe('Quote request submitted successfully');
    });

    it('should return 405 for non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('method_not_allowed');
      expect(data.message).toBe('Only POST method is allowed');
    });

    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });
      // Products mock should not be called
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({ in: jest.fn() })),
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) }))
      }));
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [{ product_id: 'product-1', quantity: 1 }] }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('unauthorized');
      expect(data.message).toBe('Authentication required');
    });

    it('should return 400 for missing request body', async () => {
      const { req, res } = createMocks({ method: 'POST' });
      // Remove the body property entirely to simulate missing body
      delete req.body;
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Request body is required');
    });

    it('should return 400 for empty items array', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: []
        }
      });

      const handler = require('../../../pages/api/quotes/request').default;
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
          items: [{ quantity: 1 }] // Missing product_id
        }
      });

      const handler = require('../../../pages/api/quotes/request').default;
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
          items: [{ product_id: 'product-1', quantity: 0 }] // Invalid quantity
        }
      });

      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Item 1: quantity must be a number greater than 0');
    });

    it('should return 404 when product is not found', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: [{ id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 100 }],
                error: null
              }))
            }))
          };
        }
        return mockSupabase.from();
      });
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [
          { product_id: 'product-1', quantity: 1 },
          { product_id: 'product-2', quantity: 1 }
        ] }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('not_found');
      expect(data.message).toBe('Product(s) not found: product-2');
    });

    it('should return 409 when product is out of stock', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: [{ id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 3 }],
                error: null
              }))
            }))
          };
        }
        return mockSupabase.from();
      });
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [{ product_id: 'product-1', quantity: 5 }] }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('out_of_stock');
      expect(data.message).toBe('Only 3 units available for Test Product 1');
    });

    it('should return 500 when database error occurs during product fetch', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: null,
                error: new Error('Database connection failed')
              }))
            }))
          };
        }
        return mockSupabase.from();
      });
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [{ product_id: 'product-1', quantity: 1 }] }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('internal');
      expect(data.message).toBe('Database error while fetching products');
    });

    it('should return 500 when database error occurs during quote insertion', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: [{ id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 100 }],
                error: null
              }))
            }))
          };
        } else if (table === 'quotes') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: null,
                  error: new Error('Insert failed')
                }))
              }))
            }))
          };
        }
        return mockSupabase.from();
      });
      const { req, res } = createMocks({
        method: 'POST',
        body: { items: [{ product_id: 'product-1', quantity: 1 }] }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('internal');
      expect(data.message).toBe('Database error while creating quote request');
    });

    it('should handle optional fields correctly', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'products') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: [
                  { id: 'product-1', name: 'Test Product 1', price: 29.99, inventory_count: 100 },
                  { id: 'product-2', name: 'Test Product 2', price: 49.99, inventory_count: 50 }
                ],
                error: null
              }))
            }))
          };
        } else if (table === 'quotes') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: { id: 'test-quote-id' },
                  error: null
                }))
              }))
            }))
          };
        }
        return mockSupabase.from();
      });
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [
            { product_id: 'product-1', quantity: 1 },
            { product_id: 'product-2', quantity: 1 }
          ],
          company_name: 'Test Co',
          contact_name: 'Alice',
          contact_email: 'alice@example.com',
          contact_phone: '123-456-7890',
          additional_notes: 'Please call before delivery.'
        }
      });
      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.quote_id).toBe('test-quote-id');
      expect(data.message).toBe('Quote request submitted successfully');
    });

    it('should validate quantity maximum limit', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [{ product_id: 'product-1', quantity: 1000 }] // Exceeds 999 limit
        }
      });

      const handler = require('../../../pages/api/quotes/request').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('validation_error');
      expect(data.message).toBe('Item 1: quantity cannot exceed 999');
    });
  });
}); 