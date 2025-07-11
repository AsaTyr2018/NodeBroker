const request = require('supertest');
let app;

describe('Certificates API', () => {
  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    app = require('../src/index');
  });

  test('issue and list certificate', async () => {
    const domain = 'cert.local';
    const res = await request(app).post('/api/certs').send({ domain });
    expect(res.statusCode).toBe(201);
    const list = await request(app).get('/api/certs');
    expect(list.body.find(c => c.domain === domain)).toBeDefined();
  });
});
