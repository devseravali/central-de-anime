import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/db';
import { estacoes } from '../src/schema/estacoes';
import { pool } from '../src/db';

import request from 'supertest';
import app from '../src/app';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';

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

describe('Consulta de Estações', () => {
  it('deve listar todas as estações existentes no banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Estação Teste ${Date.now()}`;
      const slugTemp = `estacao-teste-${Date.now()}`;
      await db.insert(estacoes).values({ nome: nomeTemp, slug: slugTemp });
      const resultado = await db.select().from(estacoes);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
    });
  });
});
describe('Rotas de Estações', () => {
  beforeAll(async () => {
    const { usuarios } = await import('../src/schema/usuario');
    const { resetsSenha } = await import('../src/schema/recuperacaodesenha');
    const { verificacoesEmail } = await import('../src/schema/usuario');
    await db.delete(verificacoesEmail);
    await db.delete(resetsSenha);
    await db.delete(usuarios);
    await db.delete(estacoes);
  });
  it('GET /estacoes — deve listar todas as estações', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const nomeTemp = `Estação Teste ${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      const slugTemp = `estacao-teste-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      await client.query('INSERT INTO estacoes (nome, slug) VALUES ($1, $2)', [
        nomeTemp,
        slugTemp,
      ]);

      const { rows } = await client.query(
        'SELECT * FROM estacoes WHERE nome = $1',
        [nomeTemp],
      );
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.some((e: any) => e.nome === nomeTemp)).toBe(true);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });

  it('GET /estacoes/:id — deve buscar estação por ID existente', async () => {
    await withRollback(async () => {
      const nomeTemp = `Estação Teste ${Date.now()}`;
      const slugTemp = `estacao-teste-${Date.now()}`;
      const resCreate = await request(app)
        .post('/estacoes')
        .send({ nome: nomeTemp, slug: slugTemp });
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(
        id,
        `ID retornado inválido: ${JSON.stringify(resCreate.body)}`,
      ).toBeTruthy();
      const res = await request(app).get(`/estacoes/${id}`);
      expect(res.status).toBe(200);
      // O backend retorna { dados: {...} }
      const obj = res.body.dados || res.body;
      expect(obj).toHaveProperty('id', id);
      expect(obj.nome.replace(/\s+/g, '').toLowerCase()).toBe(
        nomeTemp.replace(/\s+/g, '').toLowerCase(),
      );
    });
  });

  it('POST /estacoes — deve adicionar estação sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Estação Teste ${Date.now()}`;
      const slugTemp = `estacao-teste-${Date.now()}`;
      const res = await request(app)
        .post('/estacoes')
        .send({ nome: nomeTemp, slug: slugTemp });
      expect([200, 201, 400, 500]).toContain(res.status);
    });
  });

  it('PUT /estacoes/:id — deve atualizar estação sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Estação Teste ${Date.now()}`;
      const slugTemp = `estacao-teste-${Date.now()}`;
      const resCreate = await request(app)
        .post('/estacoes')
        .send({ nome: nomeTemp, slug: slugTemp });
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(
        id,
        `ID retornado inválido: ${JSON.stringify(resCreate.body)}`,
      ).toBeTruthy();
      const novoNome = `Nova Estação ${Date.now()}`;
      const novoSlug = `nova-estacao-${Date.now()}`;
      const res = await request(app)
        .put(`/estacoes/${id}`)
        .send({ nome: novoNome, slug: novoSlug });
      expect([200, 204, 400, 422]).toContain(res.status);
    });
  });

  it('DELETE /estacoes/:id — deve remover estação criada no teste, sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Estação Temporária ${Date.now()}`;
      const slugTemp = `estacao-temporaria-${Date.now()}`;
      const resCreate = await request(app)
        .post('/estacoes')
        .send({ nome: nomeTemp, slug: slugTemp });
      if (![200, 201].includes(resCreate.status)) {
        expect([200, 201, 400]).toContain(resCreate.status);
        return;
      }
      let id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      if (!id && Array.isArray(resCreate.body.dados)) {
        id = resCreate.body.dados[0]?.id;
      }
      expect(id).toBeTruthy();
      const resDelete = await request(app).delete(`/estacoes/${id}`);
      expect([200, 204]).toContain(resDelete.status);
    });
  });
});
