import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/wishlist';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  // Reset all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('/api/wishlist', () => {
  describe('POST /api/wishlist', () => {
    it('should add item to wishlist successfully', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        price: 29.99
      };

      // Mock successful product check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null
            })
          })
        })
      });

      // Mock successful wishlist addition
      mockSupabaseClient.from.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({
          data: [{ user_id: '123e4567-e89b-12d3-a456-426614174000', product_id: 'product-123' }],
          error: null
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'add'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.isSaved).toBe(true);
    });

    it('should remove item from wishlist successfully', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        price: 29.99
      };

      // Mock successful product check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null
            })
          })
        })
      });

      // Mock existing wishlist item
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: '123e4567-e89b-12d3-a456-426614174000', product_id: 'product-123' },
                error: null
              })
            })
          })
        })
      });

      // Mock successful removal
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'remove'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.isSaved).toBe(false);
    });

    it('should return 405 for non-POST/GET methods', async () => {
      const { req, res } = createMocks({
        method: 'PUT'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 400 for missing required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123'
          // Missing action
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Product ID and action are required');
    });

    it('should return 400 for invalid action', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'invalid'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Action must be "add" or "remove"');
    });

    it('should return 404 for non-existent product', async () => {
      // Mock product not found
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'nonexistent-product',
          action: 'add'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Product not found');
    });

    it('should return 409 for duplicate add', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        price: 29.99
      };

      // Mock successful product check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null
            })
          })
        })
      });

      // Mock upsert with duplicate constraint error
      mockSupabaseClient.from.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'add'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Item already in wishlist');
    });

    it('should return 404 for remove non-existent item', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        price: 29.99
      };

      // Mock successful product check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null
            })
          })
        })
      });

      // Mock no existing wishlist item
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null
              })
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'remove'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Item not in wishlist');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          action: 'add'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Database error');
    });
  });

  describe('GET /api/wishlist', () => {
    it('should get user wishlist successfully', async () => {
      const mockWishlistItems = [
        {
          product_id: 'product-1',
          products: {
            id: 'product-1',
            name: 'Product 1',
            price: 29.99,
            images: ['image1.jpg'],
            inventory_count: 10,
            brands: { name: 'Brand 1', slug: 'brand1' }
          }
        },
        {
          product_id: 'product-2',
          products: {
            id: 'product-2',
            name: 'Product 2',
            price: 39.99,
            images: ['image2.jpg'],
            inventory_count: 5,
            brands: { name: 'Brand 2', slug: 'brand2' }
          }
        }
      ];

      // Mock successful wishlist fetch
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockWishlistItems,
                error: null
              })
            })
          })
        })
      });

      // Mock count query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { count: 2 },
              error: null
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.wishlist).toHaveLength(2);
      expect(data.pagination).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      const mockWishlistItems = [
        {
          product_id: 'product-1',
          products: {
            id: 'product-1',
            name: 'Product 1',
            price: 29.99,
            images: ['image1.jpg'],
            inventory_count: 10,
            brands: { name: 'Brand 1', slug: 'brand1' }
          }
        }
      ];

      // Mock paginated wishlist fetch
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockWishlistItems,
                error: null
              })
            })
          })
        })
      });

      // Mock count query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { count: 25 },
              error: null
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '2', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.pages).toBe(3);
    });

    it('should return empty wishlist when user has no items', async () => {
      // Mock no wishlist items
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      });

      // Mock count query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { count: 0 },
              error: null
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.wishlist).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        })
      });

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Database error');
    });
  });
}); 