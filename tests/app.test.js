import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';

// Uses the same default secret as src/utils/jwt.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const sign = payload => jwt.sign(payload, JWT_SECRET);

const tokens = {
  user: sign({ id: 1, email: 'user@test.com', role: 'user' }),
  admin: sign({ id: 2, email: 'admin@test.com', role: 'admin' }),
};

// ---------------------------------------------------------------------------
// Base routes
// ---------------------------------------------------------------------------
describe('GET /', () => {
  it('returns 200 with Hello World', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});

describe('GET /health', () => {
  it('returns 200 with status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('GET /api', () => {
  it('returns 200 with working message', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('API is working');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/sign-up — validation (no DB hit on failure)
// ---------------------------------------------------------------------------
describe('POST /api/auth/sign-up', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/sign-up')
      .send({ name: 'Test', email: 'not-an-email', password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 when name is too short', async () => {
    const res = await request(app)
      .post('/api/auth/sign-up')
      .send({ name: 'A', email: 'test@example.com', password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/sign-up')
      .send({ name: 'Test', email: 'test@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

// ---------------------------------------------------------------------------
// Users routes — authentication guard (no DB hit, fails at middleware)
// ---------------------------------------------------------------------------
describe('Users routes — no token', () => {
  it('GET /api/users returns 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('GET /api/users/:id returns 401', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/users/:id returns 401', async () => {
    const res = await request(app).patch('/api/users/1').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/users/:id/password returns 401', async () => {
    const res = await request(app)
      .patch('/api/users/1/password')
      .send({ currentPassword: 'old', newPassword: 'newpass1' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/users/:id returns 401', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(401);
  });
});

describe('Users routes — invalid token', () => {
  it('GET /api/users returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer not.a.valid.token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});

// ---------------------------------------------------------------------------
// Users routes — role guard (no DB hit, fails at requireRole)
// ---------------------------------------------------------------------------
describe('Users routes — role guard', () => {
  it('DELETE /api/users/:id returns 403 for non-admin user', async () => {
    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden: insufficient permissions');
  });
});

// ---------------------------------------------------------------------------
// Users routes — param validation (fails at controller, no DB hit)
// ---------------------------------------------------------------------------
describe('Users routes — param validation', () => {
  it('GET /api/users/:id returns 400 for non-numeric id', async () => {
    const res = await request(app)
      .get('/api/users/abc')
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PATCH /api/users/:id returns 400 with empty body', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${tokens.user}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PATCH /api/users/:id/password returns 400 when passwords match', async () => {
    const res = await request(app)
      .patch('/api/users/1/password')
      .set('Authorization', `Bearer ${tokens.user}`)
      .send({ currentPassword: 'same', newPassword: 'same' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
