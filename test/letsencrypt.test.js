const request = require('supertest');

jest.mock('../src/certs', () => {
  const original = jest.requireActual('../src/certs');
  return {
    ...original,
    issueLetsEncrypt: jest.fn(() => Promise.resolve()),
  };
});

const certs = require('../src/certs');
let app;

describe('LetsEncrypt API', () => {
  beforeAll(() => {
    process.env.DB_FILE = ':memory:';
    app = require('../src/index');
  });

  test('issue letsencrypt certificate', async () => {
    const payload = { domain: 'le.local', email: 'test@example.com' };
    const res = await request(app).post('/api/letsencrypt').send(payload);
    expect(res.statusCode).toBe(201);
    expect(certs.issueLetsEncrypt).toHaveBeenCalled();
  });
});
