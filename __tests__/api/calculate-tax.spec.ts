import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/calculate-tax';

describe('/api/calculate-tax', () => {
  it('calculates tax correctly for Florida', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 100, state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({
      subtotal: 100,
      taxAmount: 7,
      total: 107,
      taxRate: 0.07,
      state: 'FL'
    });
  });

  it('calculates tax correctly for California', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 50, state: 'CA' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({
      subtotal: 50,
      taxAmount: 4.25,
      total: 54.25,
      taxRate: 0.085,
      state: 'CA'
    });
  });

  it('defaults to Florida rate for unknown state', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 200, state: 'UNKNOWN' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.taxRate).toBe(0.07);
    expect(data.state).toBe('UNKNOWN');
  });

  it('defaults to Florida when no state provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 75 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.taxRate).toBe(0.07);
    expect(data.state).toBe('FL');
  });

  it('handles decimal subtotals correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 99.99, state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.taxAmount).toBe(7);
    expect(data.total).toBe(106.99);
  });

  it('rounds tax amount to 2 decimal places', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 33.33, state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.taxAmount).toBe(2.33);
    expect(data.total).toBe(35.66);
  });

  it('rejects invalid method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      body: { subtotal: 100 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('rejects missing subtotal', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid subtotal. Must be a positive number.'
    });
  });

  it('rejects zero subtotal', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 0, state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid subtotal. Must be a positive number.'
    });
  });

  it('rejects negative subtotal', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: -50, state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid subtotal. Must be a positive number.'
    });
  });

  it('rejects non-numeric subtotal', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 'invalid', state: 'FL' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Subtotal must be a number.'
    });
  });

  it('handles case-insensitive state codes', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 100, state: 'fl' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.state).toBe('FL');
    expect(data.taxRate).toBe(0.07);
  });

  it('includes zipCode in request but ignores it for calculation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { subtotal: 100, state: 'FL', zipCode: '33101' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.subtotal).toBe(100);
    expect(data.taxAmount).toBe(7);
    expect(data.total).toBe(107);
  });
}); 