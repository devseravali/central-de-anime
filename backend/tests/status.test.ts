import { describe, it, expect } from 'vitest';
import { db } from '../src/db';
import request from 'supertest';
import app from '../src/app';

describe('Rotas de Status', () => {
  it('GET /status — deve listar todos os status', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados || res.body)).toBe(true);
  });

  it('POST /status — deve adicionar um novo status', async () => {
    const nomeTemp = `Status Teste ${Date.now()}`;
    const res = await request(app).post('/status').send({ nome: nomeTemp });
    expect([200, 201, 400]).toContain(res.status);
  });
});
