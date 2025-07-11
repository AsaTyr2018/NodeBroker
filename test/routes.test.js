const request = require('supertest');
let app;

describe('Routes API', () => {
  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    app = require('../src/index');
  });

  test('create and list routes', async () => {
    const payload = { domain: 'test.local', target: 'http://localhost:3001' };
    const res = await request(app).post('/api/routes').send(payload);
    expect(res.statusCode).toBe(201);
    const list = await request(app).get('/api/routes');
    expect(list.body).toEqual([payload]);
  });

  test('delete route', async () => {
    const domain = 'remove.local';
    await request(app)
      .post('/api/routes')
      .send({ domain, target: 'http://localhost:3002' });
    const del = await request(app).delete('/api/routes/' + domain);
    expect(del.statusCode).toBe(200);
    const list = await request(app).get('/api/routes');
    expect(list.body.find(r => r.domain === domain)).toBeUndefined();
  });
});
