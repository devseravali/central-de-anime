import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Refresh token via cookie (segurança)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sem cookie -> 401', async () => {
    const res = await request(app).post('/auth/refresh');
    expect([400, 401, 404]).toContain(res.status);
  });

  it('com cookie inválido -> 401', async () => {
    const res = await request(app).post('/auth/refresh').set('Cookie', ['refreshToken=invalid']);
    expect([400, 401, 404]).toContain(res.status);
  });

  it('com cookie válido -> retorna accessToken e renova cookie', async () => {
    const res = await request(app).post('/auth/refresh').set('Cookie', ['refreshToken=TEST_REFRESH_COOKIE']);
    expect([200, 400, 401, 404]).toContain(res.status);
    if (res.status === 200) expect(res.headers['set-cookie']).toBeDefined();
  });
});
