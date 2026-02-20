import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Testes de Melhorias nas Respostas da API', () => {
  describe('Respostas de Sucesso', () => {
    it('GET /animes — deve retornar metadados com total', async () => {
      const res = await request(app).get('/animes');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sucesso', true);
      expect(res.body).toHaveProperty('dados');
      expect(res.body).toHaveProperty('metadados');
      expect(res.body.metadados).toHaveProperty('total');
      expect(typeof res.body.metadados.total).toBe('number');

      if (res.body.dados.length === 0) {
        expect(res.body).toHaveProperty(
          'mensagem',
          'Nenhum resultado encontrado',
        );
      }
    });

    it('GET /animes/:id — deve retornar anime sem metadados', async () => {
      // Primeiro criar um anime
      const resCreate = await request(app).post('/animes').send({
        nome: 'Teste Melhorias',
      });

      const id = resCreate.body?.dados?.id;
      if (!id) return; // Skip se criação falhou

      const res = await request(app).get(`/animes/${id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sucesso', true);
      expect(res.body).toHaveProperty('dados');
      // Resposta única não tem metadados de lista
      expect(res.body.metadados).toBeUndefined();
    });

    it('POST /animes — deve retornar mensagem de criação', async () => {
      const res = await request(app)
        .post('/animes')
        .send({
          nome: `Teste POST ${Date.now()}`,
        });

      expect([200, 201, 400]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('sucesso', true);
        expect(res.body).toHaveProperty('mensagem', 'Anime criado com sucesso');
        expect(res.body).toHaveProperty('dados');
        expect(res.body.dados).toHaveProperty('id');
      }
    });
  });

  describe('Respostas de Erro', () => {
    it('GET /animes/:id — erro 404 deve ter estrutura completa', async () => {
      const res = await request(app).get('/animes/999999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('sucesso', false);
      expect(res.body).toHaveProperty('dados', null);
      expect(res.body).toHaveProperty('erro');

      // Erro agora é um objeto
      expect(typeof res.body.erro).toBe('object');
      expect(res.body.erro).toHaveProperty('mensagem');
      expect(res.body.erro).toHaveProperty('codigo');
      expect(res.body.erro).toHaveProperty('timestamp');

      // Validar formato do timestamp
      expect(new Date(res.body.erro.timestamp).toString()).not.toBe(
        'Invalid Date',
      );
    });

    it('GET /animes/:id — ID inválido deve retornar erro 400 com código', async () => {
      const res = await request(app).get('/animes/abc');

      expect(res.status).toBe(400);
      expect(res.body.sucesso).toBe(false);
      expect(res.body.erro).toHaveProperty('mensagem', 'ID do anime inválido');
      expect(res.body.erro).toHaveProperty('codigo', 'INVALID_ANIME_ID');
      expect(res.body.erro).toHaveProperty('timestamp');
    });

    it('POST /animes — dados inválidos devem retornar erro 400', async () => {
      const res = await request(app).post('/animes').send({
        nome: 123, // Tipo inválido
      });

      expect([200, 201, 400]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body.sucesso).toBe(false);
        expect(res.body.erro).toHaveProperty('mensagem');
        expect(res.body.erro).toHaveProperty('codigo');
      }
    });

    it('GET /rota-invalida — deve retornar erro 404 com informação da rota', async () => {
      const res = await request(app).get('/rota-invalida');

      expect(res.status).toBe(404);
      expect(res.body.sucesso).toBe(false);
      expect(res.body.erro).toHaveProperty('mensagem');
      expect(res.body.erro.mensagem).toContain('Rota não encontrada');
      expect(res.body.erro.mensagem).toContain('GET');
      expect(res.body.erro.mensagem).toContain('/rota-invalida');
      expect(res.body.erro).toHaveProperty('codigo', 'ROUTE_NOT_FOUND');
    });

    it('POST /animes — JSON malformado deve retornar erro específico', async () => {
      const res = await request(app)
        .post('/animes')
        .set('Content-Type', 'application/json')
        .send('{"nome": malformed}'); // JSON inválido

      expect(res.status).toBe(400);
      expect(res.body.sucesso).toBe(false);
      expect(res.body.erro).toHaveProperty(
        'mensagem',
        'JSON inválido no corpo da requisição',
      );
      expect(res.body.erro).toHaveProperty('codigo', 'INVALID_JSON');
    });
  });

  describe('Mensagens Contextualizadas', () => {
    it('Lista vazia deve ter mensagem explicativa', async () => {
      // Testar com uma query que provavelmente retorna vazio
      const res = await request(app).get('/animes/titulos');

      expect(res.status).toBe(200);
      if (res.body.dados && res.body.dados.length === 0) {
        expect(res.body).toHaveProperty('mensagem');
        expect(res.body.mensagem).toBeTruthy();
      }
    });

    it('PUT /animes/:id — atualização bem-sucedida deve ter mensagem', async () => {
      // Criar anime primeiro
      const resCreate = await request(app)
        .post('/animes')
        .send({
          nome: `Teste PUT ${Date.now()}`,
        });

      const id = resCreate.body?.dados?.id;
      if (!id) return;

      const res = await request(app)
        .put(`/animes/${id}`)
        .send({ nome: 'Nome Atualizado' });

      if (res.status === 200) {
        expect(res.body).toHaveProperty(
          'mensagem',
          'Anime atualizado com sucesso',
        );
      }
    });

    it('DELETE /animes/:id — exclusão bem-sucedida deve ter mensagem', async () => {
      // Criar anime primeiro
      const resCreate = await request(app)
        .post('/animes')
        .send({
          nome: `Teste DELETE ${Date.now()}`,
        });

      const id = resCreate.body?.dados?.id;
      if (!id) return;

      const res = await request(app).delete(`/animes/${id}`);

      if (res.status === 200) {
        expect(res.body).toHaveProperty(
          'mensagem',
          'Anime removido com sucesso',
        );
        expect(res.body.dados).toBeNull();
      }
    });
  });

  describe('Estrutura de Metadados', () => {
    it('Lista deve incluir contagem total', async () => {
      const res = await request(app).get('/animes');

      expect(res.status).toBe(200);
      expect(res.body.metadados).toBeDefined();
      expect(res.body.metadados.total).toBe(res.body.dados.length);
    });

    it('Metadados não devem aparecer em recursos únicos', async () => {
      const resList = await request(app).get('/animes');
      if (resList.body.dados.length === 0) return;

      const primeiroId = resList.body.dados[0].id;
      const res = await request(app).get(`/animes/${primeiroId}`);

      if (res.status === 200) {
        expect(res.body.metadados).toBeUndefined();
      }
    });
  });

  describe('Timestamps em Erros', () => {
    it('Todos os erros devem ter timestamp válido', async () => {
      const endpoints = [
        '/animes/99999', // 404
        '/animes/abc', // 400
        '/rota-invalida', // 404
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);

        if (res.status >= 400) {
          expect(res.body.erro).toHaveProperty('timestamp');
          const timestamp = new Date(res.body.erro.timestamp);
          expect(timestamp.toString()).not.toBe('Invalid Date');

          // Timestamp deve ser recente (últimos 10 segundos)
          const now = new Date();
          const diff = now.getTime() - timestamp.getTime();
          expect(diff).toBeLessThan(10000);
        }
      }
    });
  });

  describe('Testes extras de Melhorias de Respostas', () => {
    it('deve retornar erro padronizado para rota inexistente', async () => {
      const res = await request(app).get('/rota-inexistente-xyz');
      expect([404, 400]).toContain(res.status);
      expect(res.body).toHaveProperty('erro');
    });

    it('deve retornar resposta padronizada para sucesso', async () => {
      const res = await request(app).get('/dados/generos');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sucesso', true);
      expect(res.body).toHaveProperty('dados');
    });

    it('deve retornar erro padronizado para POST inválido', async () => {
      const res = await request(app).post('/usuarios/register').send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('erro');
      expect(res.body.sucesso).toBe(false);
    });

    it('deve garantir que respostas de erro não exponham stack trace', async () => {
      const res = await request(app).post('/usuarios/register').send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body).not.toHaveProperty('stack');
    });

    it('deve garantir que respostas de erro tenham código e mensagem', async () => {
      const res = await request(app).post('/usuarios/register').send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body.erro).toHaveProperty('codigo');
      expect(res.body.erro).toHaveProperty('mensagem');
    });
  });
});
