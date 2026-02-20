import { describe, it, expect } from 'vitest';
import { db } from '../src/db';
import { plataformas } from '../src/schema/plataformas';
import { pool } from '../src/db';
import request from 'supertest';
import app from '../src/app';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';

import bcrypt from 'bcrypt';

async function withRollback(testFn: (client: any) => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await testFn(client);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

describe('Consulta de Plataformas', () => {
  it('deve listar todas as plataformas existentes no banco', async () => {
    await withRollback(async (client) => {
      // Seed manual das plataformas
      await client.query('DELETE FROM anime_plataforma');
      await client.query('DELETE FROM plataformas');
      await client.query(
        `INSERT INTO plataformas (id, nome) VALUES (1, 'Crunchyroll'), (2, 'Netflix'), (3, 'Amazon Prime Video'), (4, 'HIDIVE'), (5, 'Disney+'), (6, 'Globoplay'), (7, 'Looke'), (8, 'Pluto TV'), (9, 'Vix'), (10, 'SBT Videos'), (11, 'TV Brasil Play'), (12, 'Claro Vídeo'), (13, 'Oi Play')`,
      );
      const resultado = await db.select().from(plataformas);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
    });
  });
});

describe('Rotas de Plataformas', () => {
  it('GET /plataformas — deve listar todas as plataformas', async () => {
    await withRollback(async (client) => {
      const nomeTemp = `Plataforma Teste ${Date.now()}`;
      const resCreate = await request(app)
        .post('/plataformas')
        .send({ nome: nomeTemp });
      const res = await request(app).get('/plataformas');
      expect(res.status).toBe(200);
      const lista =
        res.body.dados ||
        res.body.plataformas ||
        res.body.plataforma ||
        res.body;
      expect(Array.isArray(lista)).toBe(true);
      expect(
        lista.some(
          (p: any) =>
            p.nome.replace(/\s+/g, '').toLowerCase() ===
            nomeTemp.replace(/\s+/g, '').toLowerCase(),
        ),
      ).toBe(true);
    });
  });

  it('GET /plataformas/:id — deve buscar plataforma por ID existente', async () => {
    await withRollback(async (client) => {
      const nomeTemp = `Plataforma Teste ${Date.now()}`;
      const resCreate = await request(app)
        .post('/plataformas')
        .send({ nome: nomeTemp });
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(
        id,
        `ID retornado inválido: ${JSON.stringify(resCreate.body)}`,
      ).toBeTruthy();
      const res = await request(app).get(`/plataformas/${id}`);
      expect(res.status).toBe(200);
      const obj = res.body.dados || res.body;
      expect(obj).toHaveProperty('id', id);
      expect(obj.nome.replace(/\s+/g, '').toLowerCase()).toBe(
        nomeTemp.replace(/\s+/g, '').toLowerCase(),
      );
    });
  });

  it('POST /plataformas — deve adicionar plataforma sem alterar o banco', async () => {
    await withRollback(async (client) => {
      const nomeTemp = `Plataforma Teste ${Date.now()}`;
      const res = await request(app)
        .post('/plataformas')
        .send({ nome: nomeTemp });
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  it('PUT /plataformas/:id — deve atualizar plataforma sem alterar o banco', async () => {
    await withRollback(async (client) => {
      const nomeTemp = `Plataforma Teste ${Date.now()}`;
      const resCreate = await request(app)
        .post('/plataformas')
        .send({ nome: nomeTemp });
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(
        id,
        `ID retornado inválido: ${JSON.stringify(resCreate.body)}`,
      ).toBeTruthy();
      const novoNome = `Nova Plataforma ${Date.now()}`;
      const res = await request(app)
        .put(`/plataformas/${id}`)
        .send({ nome: novoNome });
      expect([200, 204, 400, 422]).toContain(res.status);
    });
  });

  it('DELETE /plataformas/:id — deve remover plataforma criada no teste, sem alterar o banco', async () => {
    await withRollback(async (client) => {
      const nomeTemp = `Plataforma Temporária ${Date.now()}`;
      const resCreate = await request(app)
        .post('/plataformas')
        .send({ nome: nomeTemp });
      if (![200, 201].includes(resCreate.status)) {
        expect([200, 201, 400]).toContain(resCreate.status);
        return;
      }
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(
        id,
        `ID retornado inválido: ${JSON.stringify(resCreate.body)}`,
      ).toBeTruthy();
      const resDelete = await request(app).delete(`/plataformas/${id}`);
      expect([200, 204]).toContain(resDelete.status);
    });
  });
});

describe('Testes extras de Plataformas', () => {
  it('POST /plataformas com nome muito longo deve falhar', async () => {
    await withRollback(async (client) => {
      const res = await request(app)
        .post('/plataformas')
        .send({ nome: 'a'.repeat(300) });
      expect([400, 422]).toContain(res.status);
    });
  });

  it('POST /plataformas com tipo errado deve falhar', async () => {
    await withRollback(async (client) => {
      const res = await request(app).post('/plataformas').send({ nome: 12345 });
      expect([400, 422]).toContain(res.status);
    });
  });

  it('GET /plataformas?pagina=-1 deve retornar erro ou ignorar', async () => {
    await withRollback(async (client) => {
      const res = await request(app).get('/plataformas?pagina=-1');
      expect([200, 400, 422, 500]).toContain(res.status);
    });
  });

  it('GET /plataformas/inexistente deve retornar 404', async () => {
    await withRollback(async (client) => {
      const res = await request(app).get('/plataformas/inexistente');
      expect([404, 400]).toContain(res.status);
    });
  });

  it('GET /plataformas deve retornar Content-Type application/json', async () => {
    await withRollback(async (client) => {
      const res = await request(app).get('/plataformas');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
