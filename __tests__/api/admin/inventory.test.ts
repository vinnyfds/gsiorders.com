import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/admin/inventory';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(),
};

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (createClient as jest.Mock).mockReturnValue(mockSupabase);
  
  // Setup method chaining
  mockSupabase.from.mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });
  
  mockSelect.mockReturnValue({
    eq: mockEq,
  });
  
  mockUpdate.mockReturnValue({
    eq: mockEq,
  });
  
  mockEq.mockReturnValue({
    single: mockSingle,
    select: mockSelect,
  });
  
  mockSelect.mockReturnValue({
    single: mockSingle,
  });
});

describe('/api/admin/inventory', () => {
  describe('Method validation', () => {
    it('should only allow PUT method', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
        details: 'Only PUT method is supported',
      });
    });

    it('should reject POST method', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should reject DELETE method', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Input validation', () => {
    it('should require product_id', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          new_inventory_count: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing required field: product_id',
      });
    });

    it('should require new_inventory_count', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid field: new_inventory_count must be a number',
      });
    });

    it('should validate new_inventory_count is a number', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 'invalid',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid field: new_inventory_count must be a number',
      });
    });

    it('should not allow negative inventory count', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: -5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid field: new_inventory_count cannot be negative',
      });
    });

    it('should require integer inventory count', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 10.5,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid field: new_inventory_count must be an integer',
      });
    });

    it('should validate UUID format', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: 'invalid-uuid',
          new_inventory_count: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid field: product_id must be a valid UUID',
      });
    });
  });

  describe('Database operations', () => {
    it('should return 404 when product not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Product not found',
        details: 'No product exists with ID: 123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should successfully update inventory', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 5,
      };

      const mockUpdatedProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 15,
      };

      mockSingle
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUpdatedProduct,
          error: null,
        });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 15,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        new_count: 15,
        message: 'Successfully updated inventory for "Test Product"',
      });

      // Verify database queries
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockUpdate).toHaveBeenCalledWith({ inventory_count: 15 });
    });

    it('should handle database errors gracefully', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'SOME_ERROR', message: 'Database error' },
      });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
        details: 'Failed to update product inventory',
      });
    });

    it('should handle update errors gracefully', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 5,
      };

      mockSingle
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'UPDATE_ERROR', message: 'Update failed' },
        });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
        details: 'Failed to update product inventory',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle zero inventory count', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 10,
      };

      const mockUpdatedProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 0,
      };

      mockSingle
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUpdatedProduct,
          error: null,
        });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 0,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        new_count: 0,
        message: 'Successfully updated inventory for "Test Product"',
      });
    });

    it('should handle large inventory count', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 10,
      };

      const mockUpdatedProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        inventory_count: 9999,
      };

      mockSingle
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUpdatedProduct,
          error: null,
        });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          new_inventory_count: 9999,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        new_count: 9999,
        message: 'Successfully updated inventory for "Test Product"',
      });
    });
  });
}); 