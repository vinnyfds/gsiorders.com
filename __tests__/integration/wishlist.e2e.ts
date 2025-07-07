import { createServer } from 'http';
import next from 'next';
import supertest from 'supertest';

let request: supertest.SuperTest<supertest.Test>;
let server: any;
let app: any;

beforeAll(async () => {
  app = next({ dev: false });
  await app.prepare();
  server = createServer((req, res) => app.getRequestHandler()(req, res));
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  const { port } = server.address() as any;
  request = supertest(`http://localhost:${port}`);
}, 30000);

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
  if (app) {
    await app.close();
  }
});

describe('Wishlist API Integration', () => {
  it('GET /api/wishlist returns 200', async () => {
    await request.get('/api/wishlist').expect(200);
  });

  it('POST /api/wishlist returns 400 with invalid data', async () => {
    await request
      .post('/api/wishlist')
      .send({ action: 'invalid' })
      .expect(400);
  });

  it('POST /api/wishlist returns 400 with missing data', async () => {
    await request
      .post('/api/wishlist')
      .send({})
      .expect(400);
  });
}); 