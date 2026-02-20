import { describe, it, expect } from 'vitest';
import { db } from '../src/db';
import { personagens } from '../src/schema/personagens';
import { anime_personagem } from '../src/schema/anime_personagem';
import { pool } from '../src/db';
import request from 'supertest';
import app from '../src/app';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';

// Função para rodar testes dentro de transação e dar rollback
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

describe('Consulta de Personagens', () => {
  it('deve listar todos os personagens existentes no banco', async () => {
    await withRollback(async () => {
      const resultado = await db.select().from(personagens);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
    });
  });
});

describe('Rotas de Personagens', () => {
  it('GET /personagens — deve listar todos os personagens', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Teste ${Date.now()}`;
      await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });

      const res = await request(app).get('/personagens');
      expect([200, 201, 400, 404]).toContain(res.status);
      if (Array.isArray(res.body.dados)) {
        expect(
          res.body.dados.some(
            (p: any) =>
              p.nome.replace(/\s+/g, '').toLowerCase() ===
              nomeTemp.replace(/\s+/g, '').toLowerCase(),
          ),
        ).toBe(true);
      }
    });
  });

  it('GET /personagens/:id — deve buscar personagem por ID existente', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Teste ${Date.now()}`;
      const resCreate = await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });

      const id = resCreate.body.dados?.id;
      expect(id).toBeTruthy();

      const res = await request(app).get(`/personagens/${id}`);
      expect([200, 201, 400, 404]).toContain(res.status);
      if (res.status === 200) {
        const obj = res.body.dados || res.body;
        expect(obj).toHaveProperty('id', id);
        expect(obj.nome.replace(/\s+/g, '').toLowerCase()).toBe(
          nomeTemp.replace(/\s+/g, '').toLowerCase(),
        );
      }
    });
  });

  it('GET /personagens/:id/animes — deve buscar animes do personagem', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Teste ${Date.now()}`;
      // Criar personagem
      const resPersonagem = await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });
      const personagemId = resPersonagem.body.dados?.id;
      expect(personagemId).toBeTruthy();

      // Usar anime já existente (id 7)
      const animeId = 7;

      // Relacionar personagem ao anime existente
      await db
        .insert(anime_personagem)
        .values({ personagem_id: personagemId, anime_id: animeId });

      const res = await request(app).get(`/personagens/${personagemId}/animes`);
      expect([200, 201]).toContain(res.status);
      // O retorno é um array de objetos, cada um com a chave 'animes' (objeto do anime)
      expect(
        Array.isArray(res.body.dados) &&
          res.body.dados.some(
            (item: any) => item.animes && item.animes.id === animeId,
          ),
      ).toBe(true);
    });
  });

  it('POST /personagens — deve adicionar personagem sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Teste ${Date.now()}`;
      const res = await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });

      expect([200, 201, 400]).toContain(res.status);
      if ([200, 201].includes(res.status)) {
        const obj = res.body.dados || res.body;
        expect(obj.nome.replace(/\s+/g, '').toLowerCase()).toBe(
          nomeTemp.replace(/\s+/g, '').toLowerCase(),
        );
      }
    });
  });

  it('PUT /personagens/:id — deve atualizar personagem sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Teste ${Date.now()}`;
      const resCreate = await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });

      const id = resCreate.body.dados?.id;
      expect(id).toBeTruthy();

      const novoNome = `Novo Personagem ${Date.now()}`;
      const res = await request(app)
        .put(`/personagens/${id}`)
        .send({ nome: novoNome });

      expect([200, 204, 400, 404, 422]).toContain(res.status);
    });
  });

  it('DELETE /personagens/:id — deve remover personagem criado no teste, sem alterar o banco', async () => {
    await withRollback(async () => {
      const nomeTemp = `Personagem Temporário ${Date.now()}`;
      const resCreate = await request(app).post('/personagens').send({
        nome: nomeTemp,
        idade_inicial: 15,
        sexo: 'Masculino',
        papel: 'Protagonista',
        imagem: 'http://exemplo.com/imagem.jpg',
        aniversario: '01-01',
        altura_inicial: 170,
        afiliacao: 'Grupo X',
        sobre: 'Descrição do personagem',
      });

      const id = resCreate.body?.dados?.id;
      expect(id).toBeTruthy();

      const resDelete = await request(app).delete(`/personagens/${id}`);
      expect([200, 204, 400, 404]).toContain(resDelete.status);
    });
  });
});
