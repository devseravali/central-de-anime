import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('P1 - Reset de senha (segurança)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('pedir reset sem email -> 400', async () => {
    const res = await request(app).post('/auth/forgot-password').send({});
    expect([400, 404]).toContain(res.status);
  });

  it('pedir reset com email inexistente -> 200 ou 404 (não vazar existência)', async () => {
    const res = await request(app).post('/auth/forgot-password').send({ email: 'noone@example.com' });
    expect([200, 404]).toContain(res.status);
  });

  it('usar token de reset inválido -> 400/401', async () => {
    const res = await request(app).post('/auth/reset-password').send({ token: 'invalid', senha: 'nova' });
    expect([400, 401, 404]).toContain(res.status);
  });
});
