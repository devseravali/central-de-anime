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

describe('Rotas de Estatísticas', () => {
  const rotas = [
    { url: '/estatisticas', nome: 'gerais' },
    { url: '/estatisticas/simples', nome: 'simples' },
    { url: '/estatisticas/generos', nome: 'por gênero' },
    { url: '/estatisticas/estudios', nome: 'por estúdio' },
    {
      url: '/estatisticas/temporadas',
      nome: 'por temporada/ano',
      filtroAno: true,
    },
    { url: '/estatisticas/status', nome: 'status' },
    { url: '/estatisticas/tags', nome: 'tags' },
    { url: '/estatisticas/personagens', nome: 'personagens' },
    { url: '/estatisticas/plataformas', nome: 'plataformas' },
  ];
  rotas.forEach(({ url, nome, filtroAno }) => {
    it(`GET ${url} — deve retornar estatísticas ${nome}`, async () => {
      await withRollback(async () => {
        const res = await request(app).get(url);
        if (![200, 201].includes(res.status)) {
          console.error(`\n[${url}] Status:`, res.status, '\nBody:', res.body);
        }
        expect([200, 201]).toContain(res.status);
        expect(res.body).toBeDefined();
        expect(res.body.sucesso).toBe(true);
        expect(res.body).toHaveProperty('sucesso');
        if (url === '/estatisticas/temporadas') {
          expect(res.body.dados).toHaveProperty('totalTemporadas');
          expect(res.body.dados).toHaveProperty('temporadasPopulares');
        }
        if (url === '/estatisticas') {
          expect(res.body.dados).toHaveProperty('totalAnimes');
          expect(res.body.dados).toHaveProperty('animesPopulares');
        }
      });
    });
    if (filtroAno) {
      it(`GET ${url}?ano=2013 — deve filtrar por ano`, async () => {
        await withRollback(async () => {
          const res = await request(app).get(`${url}?ano=2013`);
          expect([200, 201]).toContain(res.status);
          expect(res.body).toBeDefined();
          expect(res.body.sucesso).toBe(true);
          expect(res.body).toHaveProperty('sucesso');
          if (url === '/estatisticas/temporadas') {
            expect(res.body.dados).toHaveProperty('temporadasPopulares');
            expect(Array.isArray(res.body.dados.temporadasPopulares)).toBe(
              true,
            );
            type Temporada = { ano: string | number; [key: string]: unknown };
            (res.body.dados.temporadasPopulares as Temporada[]).forEach((t) => {
              expect(t).toHaveProperty('ano');
              expect(String(t.ano)).toBe('2013');
            });
          }
        });
      });
    }
  });
});
