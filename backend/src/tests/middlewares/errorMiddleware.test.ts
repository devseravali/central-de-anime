import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { errorMiddleware } from '../../middlewares/errorMiddleware';

function criarAppDeErro() {
  const app = express();

  app.get('/erro-interno', () => {
    throw new Error('falha interna detalhada');
  });

  app.get('/erro-conhecido', (_req, _res, next) => {
    next({ status: 400, message: 'Requisição inválida' });
  });

  app.use(errorMiddleware);

  return app;
}

describe('errorMiddleware', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('deve preservar status e mensagem de erro conhecido', async () => {
    process.env.NODE_ENV = 'test';
    const app = criarAppDeErro();

    const response = await request(app).get('/erro-conhecido');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Requisição inválida' });
  });

  it('deve ocultar stack e detalhes internos em produção', async () => {
    process.env.NODE_ENV = 'production';
    const app = criarAppDeErro();

    const response = await request(app).get('/erro-interno');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro interno do servidor' });
  });

  it('deve incluir stack fora de produção para facilitar depuração', async () => {
    process.env.NODE_ENV = 'test';
    const app = criarAppDeErro();

    const response = await request(app).get('/erro-interno');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Erro interno do servidor');
    expect(response.body.stack).toContain('Error: falha interna detalhada');
  });
});