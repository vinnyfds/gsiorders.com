// __mocks__/stripe.ts

class MockStripe {
  constructor() {}
  checkout = {
    sessions: {
      create: jest.fn(async (params) => {
        if (params.line_items && params.line_items.length === 0) {
          throw new Error('No items in cart');
        }
        if (params.line_items && params.line_items.some((item: any) => item.quantity <= 0)) {
          throw new Error('Invalid quantity');
        }
        return {
          id: 'cs_test_123456789',
          url: 'https://checkout.stripe.com/test-session',
          metadata: params.metadata || {},
        };
      })
    }
  }
}

module.exports = MockStripe; 