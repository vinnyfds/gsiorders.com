import { setupServer } from 'msw/node';
import { http } from 'msw';

const server = setupServer(
  http.post('http://localhost:3000/api/cart', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true, cart: [] }));
  }),
  http.post('http://localhost:3000/api/checkout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ url: 'https://checkout.stripe.com/test-session' }));
  })
  // Add more handlers as needed
);

export default async function globalSetup() {
  server.listen();
  // Optionally, return a teardown function for Playwright
  return async () => server.close();
} 