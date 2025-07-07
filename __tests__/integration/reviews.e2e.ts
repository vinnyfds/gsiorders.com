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

describe('Reviews API Integration', () => {
  it('GET /api/reviews returns 400 without productId', async () => {
    await request.get('/api/reviews').expect(400);
  });

  it('GET /api/reviews returns 200 with productId', async () => {
    await request
      .get('/api/reviews?productId=test-uuid')
      .expect(200);
  });

  it('POST /api/reviews returns 400 with invalid data', async () => {
    await request
      .post('/api/reviews')
      .send({ rating: 6 })
      .expect(400);
  });

  it('POST /api/reviews returns 400 with missing data', async () => {
    await request
      .post('/api/reviews')
      .send({})
      .expect(400);
  });
}); 