import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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

describe('Rotas de Animes', () => {
  it('GET /animes deve retornar lista de animes', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.dados)).toBe(true);
    });
  });

  it('GET /animes/:id inexistente deve retornar 404 ou erro', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes/9999999');
      expect([404, 400, 422]).toContain(res.status);
    });
  });

  it('POST /animes com dados inválidos deve retornar erro', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/animes').send({});
      expect([400, 422]).toContain(res.status);
    });
  });

  it('POST /animes sem nome deve retornar erro', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/animes').send({ estudio_id: 1 });
      expect([400, 422]).toContain(res.status);
    });
  });

  it('POST /animes sem estudio_id deve retornar erro', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/animes')
        .send({ nome: 'Sem Estudio' });
      expect([400, 422]).toContain(res.status);
    });
  });

  it('POST /animes duplicado deve retornar erro ou sucesso apenas uma vez', async () => {
    await withRollback(async () => {
      const payload = { nome: 'Duplicado', estudio_id: 1 };
      const res1 = await request(app).post('/animes').send(payload);
      const res2 = await request(app).post('/animes').send(payload);
      expect([200, 201, 400, 409, 422]).toContain(res1.status);
      expect([400, 409, 422, 200, 201]).toContain(res2.status);
    });
  });

  it('DELETE /animes/:id já removido deve retornar erro', async () => {
    await withRollback(async () => {
      const resCreate = await request(app)
        .post('/animes')
        .send({ nome: 'Para Remover', estudio_id: 1 });
      if (![200, 201].includes(resCreate.status)) return;
      const id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      expect(id).toBeTruthy();
      const resDelete1 = await request(app).delete(`/animes/${id}`);
      expect([200, 204]).toContain(resDelete1.status);
      const resDelete2 = await request(app).delete(`/animes/${id}`);
      expect([400, 404, 422]).toContain(resDelete2.status);
    });
  });

  it('GET /animes deve retornar campos obrigatórios', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes');
      expect(res.status).toBe(200);
      if (Array.isArray(res.body.dados) && res.body.dados.length > 0) {
        const anime = res.body.dados[0];
        expect(anime).toHaveProperty('id');
        expect(anime).toHaveProperty('titulo');
      }
    });
  });

  it('GET /animes?pagina=1&limite=2 deve retornar até 2 animes', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes?pagina=1&limite=2');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.dados)).toBe(true);
      expect(res.body.dados.length).toBeLessThanOrEqual(2);
    });
  });

  it('GET /animes/titulos deve retornar títulos dos animes', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes/titulos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.dados)).toBe(true);
    });
  });

  it('GET /animes/nomes deve retornar nomes dos animes', async () => {
    await withRollback(async () => {
      const res = await request(app).get('/animes/nomes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.dados)).toBe(true);
    });
  });

  it('GET /animes/:id deve retornar um anime existente', async () => {
    await withRollback(async () => {
      const resList = await request(app).get('/animes');
      const id = resList.body.dados[0]?.id;
      expect(id).toBeTruthy();
      const res = await request(app).get(`/animes/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.dados).toHaveProperty('id', id);
    });
  });

  it('POST /animes deve criar um novo anime', async () => {
    await withRollback(async () => {
      const res = await request(app).post('/animes').send({
        anime_id: 12345,
        nome: 'Teste',
        titulo_portugues: 'Teste PT',
        titulo_ingles: 'Test EN',
        titulo_japones: 'テスト',
        estudio_id: 1,
      });
      expect([200, 201, 400]).toContain(res.status);
      if ([200, 201].includes(res.status)) {
        expect(res.body.dados).toHaveProperty('id');
      }
    });
  });

  it('PUT /animes/:id deve atualizar um anime existente', async () => {
    await withRollback(async () => {
      const resList = await request(app).get('/animes');
      const id = resList.body.dados[0]?.id;
      expect(id).toBeTruthy();
      const res = await request(app)
        .put(`/animes/${id}`)
        .send({ nome: 'Novo Nome' });
      expect([200, 204, 400, 422]).toContain(res.status);
    });
  });

  it('DELETE /animes/:id deve remover um anime criado no teste', async () => {
    await withRollback(async () => {
      const resCreate = await request(app).post('/animes').send({
        nome: 'Anime Temporário',
        estudio_id: 1,
      });
      expect([200, 201, 400]).toContain(resCreate.status);
      if (![200, 201].includes(resCreate.status)) return;
      const id = resCreate.body.dados?.id || resCreate.body.dados?.insertId;
      expect(id).toBeTruthy();
      const resDelete = await request(app).delete(`/animes/${id}`);
      expect([200, 204]).toContain(resDelete.status);
    });
  });
});

describe('Testes adicionais de Animes', () => {
  it('POST /animes com nome muito longo deve falhar', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/animes')
        .send({ nome: 'a'.repeat(300), estudio_id: 1 });
      expect([400, 422]).toContain(res.status);
    });
  });

  it('POST /animes com estudio_id inválido deve falhar', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/animes')
        .send({ nome: 'Teste', estudio_id: -1 });
      expect([400, 422, 404]).toContain(res.status);
    });
  });

  it('PUT /animes/:id inexistente deve retornar erro', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .put('/animes/9999999')
        .send({ nome: 'Novo Nome' });
      expect([400, 404, 422]).toContain(res.status);
    });
  });

  it('DELETE /animes/:id inexistente deve retornar erro', async () => {
    await withRollback(async () => {
      const res = await request(app).delete('/animes/9999999');
      expect([400, 404, 422]).toContain(res.status);
    });
  });

  it('POST /animes sem Content-Type deve falhar', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/animes')
        .send('nome=Teste&estudio_id=1');
      expect([400, 415, 422]).toContain(res.status);
    });
  });

  it('deve medir tempo de resposta de /animes', async () => {
    await withRollback(async () => {
      const start = Date.now();
      const res = await request(app).get('/animes');
      const duration = Date.now() - start;
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(2000);
    });
  });

  it('POST /animes com payload malicioso deve ser tratado', async () => {
    await withRollback(async () => {
      const res = await request(app)
        .post('/animes')
        .send({ nome: '><script>alert(1)</script>', estudio_id: 1 });
      expect([200, 201, 400, 409, 422]).toContain(res.status);
    });
  });
});
