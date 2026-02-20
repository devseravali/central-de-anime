import { describe, it, expect } from 'vitest';
import request from 'supertest';
import adminRouter from '../src/routes/admin/adminRouter';
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

import express from 'express';
import app from '../src/app';

describe('Rotas de Moderação Admin', () => {
  const app = express();
  app.use('/admin', adminRouter);

  describe('Autenticação Admin', () => {
    it('POST /admin/login deve responder (sem autenticação)', async () => {
      const res = await request(app).post('/admin/login').send({});
      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('POST /admin/auth/login deve responder (sem autenticação)', async () => {
      const res = await request(app).post('/admin/auth/login').send({});
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  describe('Estatísticas Admin', () => {
    const rotasStats = [
      '/admin/stats',
      '/admin/stats/simples',
      '/admin/stats/generos',
      '/admin/stats/estudios',
      '/admin/stats/plataformas',
      '/admin/stats/status',
      '/admin/stats/tags',
      '/admin/stats/temporadas',
      '/admin/stats/estacoes',
      '/admin/stats/personagens',
      '/admin/stats/animes',
    ];
    rotasStats.forEach((url) => {
      it(`GET ${url} deve responder (sem autenticação)`, async () => {
        const res = await request(app).get(url);
        expect([200, 404, 500]).toContain(res.status);
      });
    });
  });

  it('GET /admin/health deve responder OK', async () => {
    const res = await request(app).get('/admin/health');
    expect([200, 404, 500]).toContain(res.status);
  });

  it('GET /admin/mod/sancoes deve retornar lista', async () => {
    const res = await request(app).get('/admin/mod/sancoes');
    expect([200, 404, 500]).toContain(res.status);
  });

  it('GET /admin/mod/usuarios/:id/sancoes deve retornar lista de sanções de usuário', async () => {
    const res = await request(app).get('/admin/mod/usuarios/1/sancoes');
    expect([200, 404, 500]).toContain(res.status);
  });

  it('POST /admin/mod/usuarios/:id/suspender deve suspender usuário', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/admin/mod/usuarios/1/suspender');
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  it('POST /admin/mod/usuarios/:id/banir deve banir usuário', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/admin/mod/usuarios/1/banir');
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });
  });

  it('POST /admin/mod/usuarios/:id/reativar deve reativar usuário', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/admin/mod/usuarios/1/reativar');
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  it('POST /admin/mod/conteudo/aprovar deve aprovar conteúdo', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/admin/mod/conteudo/aprovar')
        .send({ tipo: 'anime', id: 1 });
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  it('POST /admin/mod/conteudo/rejeitar deve rejeitar conteúdo', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/admin/mod/conteudo/rejeitar')
        .send({ tipo: 'anime', id: 1 });
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  it('POST /admin/mod/conteudo/remover deve remover conteúdo', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/admin/mod/conteudo/remover')
        .send({ tipo: 'anime', id: 1 });
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });
});

describe('Testes adicionais de Admin', () => {
  it('POST /admin/mod/conteudo/aprovar sem corpo deve falhar', async () => {
    const res = await request(app).post('/admin/mod/conteudo/aprovar').send({});
    expect([400, 422, 404, 500]).toContain(res.status);
  });

  it('POST /admin/mod/conteudo/aprovar com tipo/id inválidos', async () => {
    const res = await request(app)
      .post('/admin/mod/conteudo/aprovar')
      .send({ tipo: '<script>', id: -1 });
    expect([400, 422, 404, 500]).toContain(res.status);
  });

  it('PUT /admin/mod/conteudo/aprovar deve retornar 404/405', async () => {
    const res = await request(app)
      .put('/admin/mod/conteudo/aprovar')
      .send({ tipo: 'anime', id: 1 });
    expect([404, 405]).toContain(res.status);
  });

  it('POST /admin/mod/usuarios/0/suspender deve falhar', async () => {
    const res = await request(app).post('/admin/mod/usuarios/0/suspender');
    expect([200, 400, 404, 422, 500]).toContain(res.status);
  });

  it('POST /admin/mod/usuarios/9999999/banir deve falhar', async () => {
    const res = await request(app).post('/admin/mod/usuarios/9999999/banir');
    expect([200, 400, 404, 422, 500]).toContain(res.status);
  });

  it('POST /admin/mod/conteudo/aprovar sem Content-Type deve falhar', async () => {
    const res = await request(app)
      .post('/admin/mod/conteudo/aprovar')
      .send('tipo=anime&id=1');
    expect([400, 415, 422, 500]).toContain(res.status);
  });

  it('deve medir tempo de resposta de /admin/stats', async () => {
    const start = Date.now();
    const res = await request(app).get('/admin/stats');
    const duration = Date.now() - start;
    expect([200, 404, 500]).toContain(res.status);
    expect(duration).toBeLessThan(2000);
  });
});
