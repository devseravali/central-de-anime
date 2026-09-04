import express from 'express';
import type { RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { validationMiddleware } from '../../middlewares/validationMiddleware';

function criarAppDeValidacao(handler: RequestHandler) {
  const app = express();

  app.use(express.json());
  app.post(
    '/animes/:id',
    validationMiddleware({
      params: z.object({ id: z.coerce.number().int().positive() }).strict(),
      query: z.object({ pagina: z.coerce.number().int().positive() }).strict(),
      body: z.object({ titulo: z.string().trim().min(1) }).strict(),
    }),
    handler
  );

  return app;
}

describe('validationMiddleware', () => {
  it('deve impedir execução do handler quando o body é inválido', async () => {
    const spy = vi.fn();
    const handler: RequestHandler = (_req, res) => {
      spy();
      res.status(200).json({ ok: true });
    };
    const app = criarAppDeValidacao(handler);

    const response = await request(app)
      .post('/animes/1?pagina=1')
      .send({ titulo: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(spy).not.toHaveBeenCalled();
  });

  it('deve rejeitar parâmetro inválido sem executar o handler', async () => {
    const spy = vi.fn();
    const handler: RequestHandler = (_req, res) => {
      spy();
      res.status(200).json({ ok: true });
    };
    const app = criarAppDeValidacao(handler);

    const response = await request(app)
      .post('/animes/abc?pagina=1')
      .send({ titulo: 'One Piece' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'params.id' }),
      ])
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('deve aceitar payload válido e entregar dados convertidos ao handler', async () => {
    const spy = vi.fn();
    const handler: RequestHandler = (req, res) => {
      spy();
      res.status(200).json({
        id: req.params.id,
        pagina: req.query.pagina,
        titulo: req.body.titulo,
      });
    };
    const app = criarAppDeValidacao(handler);

    const response = await request(app)
      .post('/animes/7?pagina=2')
      .send({ titulo: 'Naruto' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 7,
      pagina: '2',
      titulo: 'Naruto',
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});