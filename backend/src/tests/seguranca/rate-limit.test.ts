import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function criarAppDeTeste() {
  vi.resetModules();
  const { loginRateLimiter, registerRateLimiter, forgotRateLimiter } = await import('../../middlewares/rateLimiter');
  const app = express();

  app.use(express.json());
  app.post('/auth/login', loginRateLimiter, (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.post('/auth/register', registerRateLimiter, (_req, res) => {
    res.status(201).json({ ok: true });
  });
  app.post('/auth/forgot-password', forgotRateLimiter, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('P1 - Rate limiting', () => {
  const originalEnv = {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    loginMax: process.env.RATE_LIMIT_LOGIN_MAX,
    registerMax: process.env.RATE_LIMIT_REGISTER_MAX,
    forgotMax: process.env.RATE_LIMIT_FORGOT_MAX,
  };

  afterEach(() => {
    process.env.RATE_LIMIT_WINDOW_MS = originalEnv.windowMs;
    process.env.RATE_LIMIT_LOGIN_MAX = originalEnv.loginMax;
    process.env.RATE_LIMIT_REGISTER_MAX = originalEnv.registerMax;
    process.env.RATE_LIMIT_FORGOT_MAX = originalEnv.forgotMax;
  });

  it('deve permitir requisições dentro do limite e bloquear o excesso no login', async () => {
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_LOGIN_MAX = '2';
    const app = await criarAppDeTeste();

    const primeira = await request(app).post('/auth/login').send({ email: 'a@teste.com', senha: '123456' });
    const segunda = await request(app).post('/auth/login').send({ email: 'a@teste.com', senha: '123456' });
    const terceira = await request(app).post('/auth/login').send({ email: 'a@teste.com', senha: '123456' });

    expect(primeira.status).toBe(200);
    expect(segunda.status).toBe(200);
    expect(terceira.status).toBe(429);
    expect(terceira.body).toEqual({
      message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    });
  });

  it('deve manter limites independentes entre login e cadastro', async () => {
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_LOGIN_MAX = '1';
    process.env.RATE_LIMIT_REGISTER_MAX = '2';
    const app = await criarAppDeTeste();

    const loginPermitido = await request(app).post('/auth/login').send({ email: 'a@teste.com', senha: '123456' });
    const loginBloqueado = await request(app).post('/auth/login').send({ email: 'a@teste.com', senha: '123456' });
    const cadastroPermitido = await request(app).post('/auth/register').send({ nome: 'Luffy', email: 'a@teste.com', senha: '123456' });

    expect(loginPermitido.status).toBe(200);
    expect(loginBloqueado.status).toBe(429);
    expect(cadastroPermitido.status).toBe(201);
  });

  it('deve proteger o endpoint de recuperação de senha', async () => {
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_FORGOT_MAX = '1';
    const app = await criarAppDeTeste();

    const primeira = await request(app).post('/auth/forgot-password').send({ email: 'a@teste.com' });
    const segunda = await request(app).post('/auth/forgot-password').send({ email: 'a@teste.com' });

    expect(primeira.status).toBe(200);
    expect(segunda.status).toBe(429);
    expect(segunda.body).toEqual({
      message: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
    });
  });
});
