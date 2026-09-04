import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const personagemControllerMocks = vi.hoisted(() => ({
  list: vi.fn((_req, res) => res.status(200).json([{ id: 1, nome: 'Monkey D. Luffy' }])),
  getById: vi.fn((_req, res) => res.status(200).json({ id: 1, nome: 'Monkey D. Luffy' })),
  listByAnimeId: vi.fn((_req, res) => res.status(200).json([{ id: 1 }])),
}));

vi.mock('../../controllers/personagemController', () => ({
  personagemController: personagemControllerMocks,
}));

import app from '../../app';

describe('Rotas de Personagens (/personagens)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve delegar GET /personagens para personagemController.list', async () => {
    const res = await request(app).get('/personagens');

    expect(res.status).toBe(200);
    expect(personagemControllerMocks.list).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual([{ id: 1, nome: 'Monkey D. Luffy' }]);
  });

  it('deve delegar GET /personagens/:id para personagemController.getById', async () => {
    const res = await request(app).get('/personagens/1');

    expect(res.status).toBe(200);
    expect(personagemControllerMocks.getById).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual({ id: 1, nome: 'Monkey D. Luffy' });
  });
});
