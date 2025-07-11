const request = require('supertest');
let app;

describe('HA Routes API', () => {
  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    app = require('../src/index');
  });

  test('create and list ha routes', async () => {
    const payload = { domain: 'ha.local', primary: 'http://localhost:3001', backup: 'http://localhost:3002' };
    const res = await request(app).post('/api/ha/routes').send(payload);
    expect(res.statusCode).toBe(201);
    const list = await request(app).get('/api/ha/routes');
    expect(list.body).toEqual([payload]);
  });

  test('delete ha route', async () => {
    const domain = 'remove.ha';
    await request(app)
      .post('/api/ha/routes')
      .send({ domain, primary: 'http://localhost:3001', backup: 'http://localhost:3002' });
    const del = await request(app).delete('/api/ha/routes/' + domain);
    expect(del.statusCode).toBe(200);
    const list = await request(app).get('/api/ha/routes');
    expect(list.body.find(r => r.domain === domain)).toBeUndefined();
  });
});
