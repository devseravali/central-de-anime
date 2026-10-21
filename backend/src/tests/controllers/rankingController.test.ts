import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rankingServiceMocks = vi.hoisted(() => ({
  getTopAnimes: vi.fn(),
  getTopPersonagens: vi.fn(),
}));

vi.mock('../../services/rankingService', () => ({ rankingService: rankingServiceMocks }));

import { rankingController } from '../../controllers/rankingController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('rankingController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar top animes com sucesso', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getTopAnimes.mockResolvedValueOnce([{ id: 1, titulo: 'Naruto' }]);

    await rankingController.getTopAnimes(req, res);

    expect(rankingServiceMocks.getTopAnimes).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 1, titulo: 'Naruto' }]);
  });

  it('deve retornar 500 caso top animes lance exceção', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getTopAnimes.mockRejectedValueOnce(new Error('Erro de banco'));

    await rankingController.getTopAnimes(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar ranking de animes' });
  });

  it('deve retornar top personagens com sucesso', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getTopPersonagens.mockResolvedValueOnce([{ id: 2, nome: 'Luffy' }]);

    await rankingController.getTopPersonagens(req, res);

    expect(rankingServiceMocks.getTopPersonagens).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 2, nome: 'Luffy' }]);
  });

  it('deve retornar 500 caso top personagens lance exceção', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getTopPersonagens.mockRejectedValueOnce(new Error('Erro de banco'));

    await rankingController.getTopPersonagens(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar ranking de personagens' });
  });
});
