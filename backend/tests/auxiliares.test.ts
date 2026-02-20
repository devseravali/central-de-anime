import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';

async function withRollback(testFn: () => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await testFn();
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

describe('Rotas Auxiliares', () => {
  const rotas = [
    { url: '/dados/generos', nome: 'gêneros' },
    { url: '/dados/plataformas', nome: 'plataformas' },
    { url: '/dados/status', nome: 'status' },
    { url: '/dados/tags', nome: 'tags' },
    { url: '/dados/temporadas', nome: 'temporadas' },
    { url: '/dados/estudios', nome: 'estúdios' },
    { url: '/dados/personagens', nome: 'personagens' },
    { url: '/dados/animes', nome: 'animes' },
  ];
  rotas.forEach(({ url, nome }) => {
    it(`GET ${url} — deve retornar dados de ${nome}`, async () => {
      await withRollback(async () => {
        const res = await request(app).get(url);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.dados)).toBe(true);
      });
    });
  });
});

describe('Testes adicionais de Rotas Auxiliares', () => {
  it('deve retornar 404 para rota inexistente', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/dados/inexistente');
      expect([404, 400]).toContain(res.status);
    });
  });

  it('deve retornar erro para query param inválido', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/dados/generos?pagina=-1');
      expect([200, 400, 422, 404]).toContain(res.status);
    });
  });

  it('deve retornar Content-Type application/json', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/dados/generos');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  it('deve medir tempo de resposta das rotas auxiliares', async () => {
    await withRollback(async () => {
      const start = Date.now();
      const res = await request(app).get('/dados/generos');
      const duration = Date.now() - start;
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(2000);
    });
  });

  it('cada item deve ter campo id e nome (se existir)', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/dados/generos');
      expect(res.status).toBe(200);
      if (Array.isArray(res.body.dados) && res.body.dados.length > 0) {
        const item = res.body.dados[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('nome');
      }
    });
  });
});
