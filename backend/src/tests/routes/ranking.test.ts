import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const rankingControllerMocks = vi.hoisted(() => ({
  getTopAnimes: vi.fn((_req, res) => res.status(200).json([{ id: 1, titulo: 'Naruto' }])),
  getTopPersonagens: vi.fn((_req, res) => res.status(200).json([{ id: 1, nome: 'Luffy' }])),
}));

vi.mock('../../controllers/rankingController', () => ({
  rankingController: rankingControllerMocks,
}));

import app from '../../app';

describe('Rotas de Ranking (/ranking)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /ranking/animes/top', () => {
    it('deve delegar ao rankingController.getTopAnimes', async () => {
      const res = await request(app).get('/ranking/animes/top');

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.getTopAnimes).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /ranking/personagens/top', () => {
    it('deve delegar ao rankingController.getTopPersonagens', async () => {
      const res = await request(app).get('/ranking/personagens/top');

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.getTopPersonagens).toHaveBeenCalledTimes(1);
    });
  });
});
