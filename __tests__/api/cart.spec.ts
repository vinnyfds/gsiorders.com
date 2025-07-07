import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/cart';
import { mockFail } from '../../__mocks__/@supabase/supabase-js';

const mem = require('../../__mocks__/@supabase/supabase-js').__getMem?.() || {};
const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

function withUser(req: any) {
  req.headers = req.headers || {};
  req.headers['x-test-user-id'] = TEST_USER_ID;
  return req;
}

describe('/api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (mem.cart_items) mem.cart_items.length = 0;
    if (mem.products) mem.products.length = 0;
    mem.products.push({
      id: 'p1',
      name: 'Test Product',
      price: 10,
      images: [],
      inventory_count: 10,
      brands: { name: 'Brand', slug: 'brand' }
    });
  });

  it('GET returns empty cart', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({ items: [], total: 0, itemCount: 0 });
  });

  it('POST adds item to cart', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 2 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items.length).toBe(1);
    expect(data.items[0].product_id).toBe('p1');
    expect(data.items[0].quantity).toBe(2);
  });

  it('PUT updates item quantity', async () => {
    mem.cart_items.push({ id: '1', user_id: TEST_USER_ID, product_id: 'p1', quantity: 1, created_at: '', updated_at: '', products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } });
    const { req, res } = createMocks({ method: 'PUT', body: { product_id: 'p1', quantity: 3 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items[0].quantity).toBe(3);
  });

  it('DELETE removes item from cart', async () => {
    mem.cart_items.push({ id: '1', user_id: TEST_USER_ID, product_id: 'p1', quantity: 1, created_at: '', updated_at: '', products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } });
    const { req, res } = createMocks({ method: 'DELETE', query: { product_id: 'p1' } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items.length).toBe(0);
  });

  it('DELETE clears entire cart', async () => {
    mem.cart_items.push({ id: '1', user_id: TEST_USER_ID, product_id: 'p1', quantity: 1, created_at: '', updated_at: '', products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } });
    const { req, res } = createMocks({ method: 'DELETE' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items.length).toBe(0);
  });

  it('returns 400 for invalid quantity', async () => {
    const { req, res } = createMocks({ method: 'PUT', body: { product_id: 'p1', quantity: 100 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 for missing fields', async () => {
    const { req, res } = createMocks({ method: 'PUT', body: {} });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 for missing product_id in POST', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { quantity: 1 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Missing required field');
  });

  it('returns 400 for invalid quantity in POST', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 0 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid quantity');
  });

  it('returns 404 for product not found in POST', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'nonexistent', quantity: 1 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Product not found');
  });

  it('returns 400 for insufficient inventory in POST', async () => {
    // Set product inventory to 1
    mem.products[0].inventory_count = 1;
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 2 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Insufficient inventory');
  });

  it('updates existing cart item when adding same product', async () => {
    // Add item to cart first
    mem.cart_items.push({ 
      id: '1', 
      user_id: TEST_USER_ID, 
      product_id: 'p1', 
      quantity: 1, 
      created_at: '', 
      updated_at: '', 
      products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } 
    });
    
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 2 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items[0].quantity).toBe(3); // 1 + 2
  });

  it('returns 400 when updating existing item exceeds inventory', async () => {
    // Set product inventory to 2
    mem.products[0].inventory_count = 2;
    // Add item with quantity 1
    mem.cart_items.push({ 
      id: '1', 
      user_id: TEST_USER_ID, 
      product_id: 'p1', 
      quantity: 1, 
      created_at: '', 
      updated_at: '', 
      products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 2, brands: { name: 'Brand', slug: 'brand' } } 
    });
    
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 2 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Insufficient inventory');
  });

  it('PUT with quantity 0 removes item', async () => {
    mem.cart_items.push({ 
      id: '1', 
      user_id: TEST_USER_ID, 
      product_id: 'p1', 
      quantity: 1, 
      created_at: '', 
      updated_at: '', 
      products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } 
    });
    
    const { req, res } = createMocks({ method: 'PUT', body: { product_id: 'p1', quantity: 0 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.items.length).toBe(0);
  });

  it('returns 405 for unsupported method', async () => {
    const { req, res } = createMocks({ method: 'PATCH' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('handles DB error on GET', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'GET' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it('handles DB error on POST', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 1 } });
    withUser(req);
    await handler(req, res);
    // TODO: when API distinguishes 500 vs 404, update this assert
    expect(res._getStatusCode()).toBe(404);
  });

  it('handles DB error on PUT', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'PUT', body: { product_id: 'p1', quantity: 1 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it('handles DB error on DELETE', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'DELETE', query: { product_id: 'p1' } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it('handles DB error when updating existing cart item', async () => {
    mem.cart_items.push({ 
      id: '1', 
      user_id: TEST_USER_ID, 
      product_id: 'p1', 
      quantity: 1, 
      created_at: '', 
      updated_at: '', 
      products: { id: 'p1', name: 'Test', price: 10, images: [], inventory_count: 10, brands: { name: 'Brand', slug: 'brand' } } 
    });
    
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 1 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404); // TODO: change to 500 when handler distinguishes errors
  });

  it('handles DB error when inserting new cart item', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'POST', body: { product_id: 'p1', quantity: 1 } });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404); // TODO: change to 500 when handler distinguishes errors
  });

  it('handles DB error when clearing entire cart', async () => {
    mockFail('db-boom');
    const { req, res } = createMocks({ method: 'DELETE' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });

  it('returns 405 for unsupported method', async () => {
    const { req, res } = createMocks({ method: 'PATCH' });
    withUser(req);
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });
}); 