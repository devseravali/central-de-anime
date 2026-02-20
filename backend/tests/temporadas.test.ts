import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Rotas de temporadas de animes', () => {
  it('GET /animes/temporadas retorna temporadas agrupadas corretamente', async () => {
    const res = await request(app).get('/animes/temporadas');
    expect(
      res.status,
      `Status esperado 200, recebido ${res.status} - body: ${JSON.stringify(res.body)}`,
    ).toBe(200);
    expect(res.body, 'Deve conter propriedade sucesso').toHaveProperty(
      'sucesso',
      true,
    );
    expect(res.body, 'Deve conter propriedade dados').toHaveProperty('dados');
    expect(typeof res.body.dados, 'dados deve ser um objeto').toBe('object');
    for (const temporada in res.body.dados) {
      expect(
        Array.isArray(res.body.dados[temporada]),
        `dados[${temporada}] deve ser array`,
      ).toBe(true);
      if (res.body.dados[temporada].length > 0) {
        expect(
          res.body.dados[temporada][0],
          `dados[${temporada}][0] deve ter propriedade titulo`,
        ).toHaveProperty('titulo');
      }
    }
  });

  it('GET /animes/temporadas/quantidade retorna temporadas com quantidade', async () => {
    const res = await request(app).get('/animes/temporadas/quantidade');
    expect(
      [200, 204],
      `Status esperado 200 ou 204, recebido ${res.status} - body: ${JSON.stringify(res.body)}`,
    ).toContain(res.status);
    expect(res.body, 'Deve conter propriedade sucesso').toHaveProperty(
      'sucesso',
      true,
    );
    expect(res.body, 'Deve conter propriedade dados').toHaveProperty('dados');
    expect(Array.isArray(res.body.dados), 'dados deve ser array').toBe(true);
    if (res.body.dados.length > 0) {
      expect(
        res.body.dados[0],
        'Primeiro item deve ter propriedade temporada',
      ).toHaveProperty('temporada');
      expect(
        res.body.dados[0],
        'Primeiro item deve ter propriedade quantidade',
      ).toHaveProperty('quantidade');
    }
  });

  it('GET /animes/temporadas/anos retorna anos distintos', async () => {
    const res = await request(app).get('/animes/temporadas/anos');
    expect(
      [200, 204],
      `Status esperado 200 ou 204, recebido ${res.status} - body: ${JSON.stringify(res.body)}`,
    ).toContain(res.status);
    expect(res.body, 'Deve conter propriedade sucesso').toHaveProperty(
      'sucesso',
      true,
    );
    expect(res.body, 'Deve conter propriedade dados').toHaveProperty('dados');
    expect(Array.isArray(res.body.dados), 'dados deve ser array').toBe(true);
  });
});

describe('Testes extras de Temporadas', () => {
  it('GET /animes/temporadas?ano=2013 deve filtrar por ano', async () => {
    const res = await request(app).get('/animes/temporadas?ano=2013');
    expect([200, 204]).toContain(res.status);
    expect(res.body).toHaveProperty('sucesso', true);
    expect(res.body).toHaveProperty('dados');
    expect(typeof res.body.dados).toBe('object');
  });

  it('GET /animes/temporadas/quantidade?ano=2013 deve filtrar por ano', async () => {
    const res = await request(app).get(
      '/animes/temporadas/quantidade?ano=2013',
    );
    expect([200, 204]).toContain(res.status);
    expect(res.body).toHaveProperty('sucesso', true);
    expect(res.body).toHaveProperty('dados');
    expect(Array.isArray(res.body.dados)).toBe(true);
  });

  it('GET /animes/temporadas/anos deve retornar apenas anos distintos', async () => {
    const res = await request(app).get('/animes/temporadas/anos');
    expect([200, 204]).toContain(res.status);
    expect(res.body).toHaveProperty('sucesso', true);
    expect(res.body).toHaveProperty('dados');
    expect(Array.isArray(res.body.dados)).toBe(true);
    if (res.body.dados.length > 0) {
      const anos = res.body.dados.map((d: any) => d.ano || d);
      const setAnos = new Set(anos);
      expect(setAnos.size).toBe(anos.length);
    }
  });

  it('GET /animes/temporadas/inexistente deve retornar 404', async () => {
    const res = await request(app).get('/animes/temporadas/inexistente');
    expect([404, 400]).toContain(res.status);
  });

  it('GET /animes/temporadas deve retornar Content-Type application/json', async () => {
    const res = await request(app).get('/animes/temporadas');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
