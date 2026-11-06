import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const login = vi.hoisted(() => vi.fn());
vi.mock('../../services/authService', () => ({
  authService: { login },
}));

import app from '../../app';

describe('Autenticação - Login (segurança)', () => {
  beforeEach(() => login.mockReset());

  it('login com credenciais inválidas -> 401', async () => {
    login.mockRejectedValueOnce(new Error('Email ou senha inválidos'));
    const res = await request(app).post('/auth/login').send({ email: 'noone@example.com', senha: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Email ou senha inválidos' });
    expect(login).toHaveBeenCalledOnce();
  });

  it('login com corpo ausente -> 400', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(login).not.toHaveBeenCalled();
  });

  it('login válido deve setar cookie HttpOnly de refresh e retornar accessToken', async () => {
    login.mockResolvedValueOnce({
      user: { id: 1, nome: 'Teste', email: 'test@example.com' },
      accessToken: 'access-token-teste',
      refreshToken: 'refresh-token-teste',
      refreshExpiraEm: new Date('2030-01-01T00:00:00.000Z'),
    });
    const res = await request(app).post('/auth/login').send({ email: 'test@example.com', senha: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access-token-teste');
    expect(res.body).not.toHaveProperty('refreshToken');
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain('refreshToken=refresh-token-teste');
    expect(setCookie[0]).toContain('HttpOnly');
    expect(setCookie[0]).toContain('SameSite=Lax');
    expect(setCookie[0]).toContain('Path=/auth');
  });
});
