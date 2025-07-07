import { createMocks } from 'node-mocks-http';

let mockSupabase: any;
let handler: any;

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => {
    return (global as any).__mockSupabase;
  }
}));

describe('/api/quotes/request', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    };
    (global as any).__mockSupabase = mockSupabase;
    handler = require('../../../pages/api/quotes/request').default;
  });

  it('should create a quote request successfully', async () => {
    const mockQuote = {
      id: 'test-quote-id',
      status: 'requested'
    };
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockQuote, error: null })
        })
      })
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { productId: 'product-1', quantity: 10, notes: 'Bulk order' },
          { productId: 'product-2', quantity: 5 }
        ],
        companyName: 'Test Company',
        contactEmail: 'test@company.com',
        specialRequirements: 'Rush delivery needed'
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.id).toBe('test-quote-id');
    expect(data.status).toBe('requested');
    expect(data.message).toContain('Quote request submitted successfully');
  });

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('should validate required items array', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        companyName: 'Test Company'
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toContain('items array is required');
  });

  it('should validate empty items array', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: []
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toContain('items array is required and must not be empty');
  });

  it('should validate item productId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { quantity: 10 }
        ]
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toContain('Each item must have a valid productId');
  });

  it('should validate item quantity', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { productId: 'product-1', quantity: 0 }
        ]
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid request');
    expect(data.details).toContain('Each item must have a valid quantity greater than 0');
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database connection failed' } })
        })
      })
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { productId: 'product-1', quantity: 10 }
        ]
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Failed to create quote request');
  });

  it('should accept minimal valid request', async () => {
    const mockQuote = {
      id: 'minimal-quote-id',
      status: 'requested'
    };
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockQuote, error: null })
        })
      })
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { productId: 'product-1', quantity: 1 }
        ]
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.id).toBe('minimal-quote-id');
    expect(data.status).toBe('requested');
  });

  it('should handle optional fields correctly', async () => {
    const mockQuote = {
      id: 'optional-fields-quote-id',
      status: 'requested'
    };
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockQuote, error: null })
        })
      })
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [
          { productId: 'product-1', quantity: 5, notes: 'Optional notes' }
        ],
        companyName: 'Optional Company',
        contactEmail: 'optional@company.com',
        specialRequirements: 'Optional requirements'
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.id).toBe('optional-fields-quote-id');
    expect(data.status).toBe('requested');
  });
}); 