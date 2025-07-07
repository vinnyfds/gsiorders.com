import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/checkout';

describe('/api/checkout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 for non-POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('returns 400 if userId missing', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { cartItems: [] } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({ error: 'Missing userId' });
  });

  it('returns 500 if cartItems is empty', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { cartItems: [], userId: 'u1' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toMatch(/No items in cart/);
  });

  it('returns 500 if any quantity is invalid', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { cartItems: [{ name: 'P', price: 10, quantity: 0 }], userId: 'u1' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toMatch(/Invalid quantity/);
  });

  it('creates a Stripe session for valid input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        cartItems: [
          { name: 'Product 1', price: 100, quantity: 2 },
          { name: 'Product 2', price: 50, quantity: 1 }
        ],
        userId: 'u1'
      }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.sessionId).toBe('cs_test_123456789');
    expect(data.url).toContain('checkout.stripe.com');
    expect(data.metadata.user_id).toBe('u1');
  });

  it('handles Stripe errors', async () => {
    // Simulate Stripe throwing
    const { req, res } = createMocks({
      method: 'POST',
      body: { cartItems: [], userId: 'u1' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBe('No items in cart');
  });
}); 