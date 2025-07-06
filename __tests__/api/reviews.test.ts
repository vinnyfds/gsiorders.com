import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/reviews';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@supabase/supabase-js';

// Type the mocked function
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

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

describe('/api/reviews', () => {
  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const mockReview = {
        id: 'review-123',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: 'product-123',
        rating: 5,
        comment: 'Great product!',
        created_at: new Date().toISOString(),
        approved: false
      };

      // Setup the mock Supabase client
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      // Mock successful product check, no existing review, successful creation
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { id: 'product-123', name: 'Test Product' },
          error: null
        })
        .mockResolvedValueOnce({
          data: null,
          error: null
        })
        .mockResolvedValueOnce({
          data: mockReview,
          error: null
        });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          rating: 5,
          comment: 'Great product! Really love it.'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.review).toBeDefined();
      expect(data.message).toContain('moderation');
    });

    it('should return 405 for non-POST/GET methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE'
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
          productId: 'product-123',
          // Missing rating and comment
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Missing required fields: productId, rating, comment');
    });

    it('should return 400 for invalid rating', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          rating: 6, // Invalid rating
          comment: 'Great product!'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Rating must be between 1 and 5');
    });

    it('should return 400 for invalid comment length', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          rating: 5,
          comment: 'Short' // Too short
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Comment must be at least 10 characters long');
    });

    it('should return 404 for non-existent product', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows returned' }
        }),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'nonexistent-product',
          rating: 5,
          comment: 'Great product! Really love it.'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Product not found');
    });

    it('should return 409 for duplicate review', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      // Mock successful product check, then existing review found
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { id: 'product-123', name: 'Test Product' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { id: 'existing-review' },
          error: null
        });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          rating: 5,
          comment: 'Great product! Really love it.'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('You have already reviewed this product');
    });

    it('should handle database errors gracefully', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      // Mock successful product check, no existing review, then database error
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { id: 'product-123', name: 'Test Product' },
          error: null
        })
        .mockResolvedValueOnce({
          data: null,
          error: null
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Database error' }
        });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          productId: 'product-123',
          rating: 5,
          comment: 'Great product! Really love it.'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Failed to create review');
    });
  });

  describe('GET /api/reviews', () => {
    it('should get reviews for a product successfully', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great product!',
          created_at: new Date().toISOString(),
          users: { email: 'user1@example.com' }
        },
        {
          id: 'review-2',
          rating: 4,
          comment: 'Good product',
          created_at: new Date().toISOString(),
          users: { email: 'user2@example.com' }
        }
      ];

      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      // Setup mock chain for reviews fetch
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: mockReviews,
        error: null
      });

      // Mock the select calls for count and rating data
      mockSupabaseClient.select
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                range: jest.fn().mockResolvedValue({
                  data: mockReviews,
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 2,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ rating: 5 }, { rating: 4 }],
              error: null
            })
          })
        });

      const { req, res } = createMocks({
        method: 'GET',
        query: { productId: 'product-123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.reviews).toHaveLength(2);
      expect(data.averageRating).toBe(4.5);
      expect(data.pagination).toBeDefined();
      expect(data.totalReviews).toBe(2);
    });

    it('should return 400 for missing productId', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Product ID is required');
    });

    it('should return empty reviews for product with no reviews', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      // Setup mock chain for empty reviews
      mockSupabaseClient.range.mockResolvedValueOnce({
        data: [],
        error: null
      });

      mockSupabaseClient.select
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                range: jest.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 0,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        });

      const { req, res } = createMocks({
        method: 'GET',
        query: { productId: 'product-123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.reviews).toHaveLength(0);
      expect(data.averageRating).toBe(0);
      expect(data.totalReviews).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great product!',
          created_at: new Date().toISOString(),
          users: { email: 'user1@example.com' }
        }
      ];

      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      mockSupabaseClient.range.mockResolvedValueOnce({
        data: mockReviews,
        error: null
      });

      mockSupabaseClient.select
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                range: jest.fn().mockResolvedValue({
                  data: mockReviews,
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 25,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ rating: 5 }],
              error: null
            })
          })
        });

      const { req, res } = createMocks({
        method: 'GET',
        query: { productId: 'product-123', page: '2', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.totalPages).toBe(3);
    });

    it('should handle database errors gracefully', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      mockSupabaseClient.range.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { productId: 'product-123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Failed to fetch reviews');
    });
  });
}); 