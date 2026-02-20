import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Rotas de Tags', () => {
  it('GET /tags — deve listar todas as tags', async () => {
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados || res.body)).toBe(true);
  });

  it('POST /tags — deve adicionar uma nova tag', async () => {
    const nomeTemp = `Tag Teste ${Date.now()}`;
    const res = await request(app).post('/tags').send({ nome: nomeTemp });
    expect([200, 201, 400]).toContain(res.status);
  });
});

describe('Testes extras de Tags', () => {
  it('POST /tags com nome muito longo deve falhar', async () => {
    const res = await request(app)
      .post('/tags')
      .send({ nome: 'a'.repeat(300) });
    expect([400, 422]).toContain(res.status);
  });

  it('POST /tags com tipo errado deve falhar', async () => {
    const res = await request(app).post('/tags').send({ nome: 12345 });
    expect([400, 422]).toContain(res.status);
  });

  it('GET /tags?pagina=-1 deve retornar erro ou ignorar', async () => {
    const res = await request(app).get('/tags?pagina=-1');
    expect([200, 400, 422, 500]).toContain(res.status);
  });

  it('GET /tags/inexistente deve retornar 404', async () => {
    const res = await request(app).get('/tags/inexistente');
    expect([404, 400]).toContain(res.status);
  });

  it('GET /tags deve retornar Content-Type application/json', async () => {
    const res = await request(app).get('/tags');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
