import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const episodioControllerMocks = vi.hoisted(() => ({
  list: vi.fn((_req, res) => res.status(200).json([{ id: 1, numero: 1, titulo: 'Episódio 1' }])),
  getById: vi.fn((_req, res) => res.status(200).json({ id: 1, numero: 1, titulo: 'Episódio 1' })),
  listByAnimeAndSeasonNumber: vi.fn((_req, res) => res.status(200).json([])),
}));

vi.mock('../../controllers/episodioController', () => ({
  episodioController: episodioControllerMocks,
}));

import app from '../../app';

describe('Rotas de Episódios (/episodios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve delegar GET /episodios para episodioController.list', async () => {
    const res = await request(app).get('/episodios');

    expect(res.status).toBe(200);
    expect(episodioControllerMocks.list).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual([{ id: 1, numero: 1, titulo: 'Episódio 1' }]);
  });

  it('deve delegar GET /episodios/:id para episodioController.getById', async () => {
    const res = await request(app).get('/episodios/1');

    expect(res.status).toBe(200);
    expect(episodioControllerMocks.getById).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual({ id: 1, numero: 1, titulo: 'Episódio 1' });
  });
});
