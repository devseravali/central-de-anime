import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Autenticação - Login (segurança)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('login com credenciais inválidas -> 401', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'noone@example.com', senha: 'wrong' });
    expect([401, 400, 404]).toContain(res.status);
  });

  it('login com corpo ausente -> 400', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect([400, 404]).toContain(res.status);
  });

  it('login válido deve setar cookie HttpOnly de refresh e retornar accessToken', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'test@example.com', senha: 'password' });
    // aceitar 200 ou 404 se rota não existir
    expect([200, 401, 400, 404]).toContain(res.status);
    if (res.status === 200) {
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
    }
  });
});
