import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const temporadaServiceMocks = vi.hoisted(() => ({
  listTemporadas: vi.fn(),
  getTemporadaById: vi.fn(),
  listTemporadasByAnimeId: vi.fn(),
}));

vi.mock('../../services/temporadaService', () => ({ temporadaService: temporadaServiceMocks }));

import { temporadaController } from '../../controllers/temporadaController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('temporadaController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve listar temporadas', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.listTemporadas.mockResolvedValueOnce([{ id: 1 }]);

    await temporadaController.list(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('deve rejeitar id inválido ao buscar temporada', async () => {
    const req = { params: { id: '' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await temporadaController.getById(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de temporada inválido' });
  });

  it('deve listar temporadas por anime', async () => {
    const req = { params: { animeId: '7' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.listTemporadasByAnimeId.mockResolvedValueOnce([{ id: 3 }]);

    await temporadaController.listByAnimeId(req, res);

    expect(temporadaServiceMocks.listTemporadasByAnimeId).toHaveBeenCalledWith(7);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 3 }]);
  });

  it('deve retornar status 500 caso a listagem de temporadas falhe', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.listTemporadas.mockRejectedValueOnce(new Error('Falha no banco'));

    await temporadaController.list(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar temporadas' });
  });

  it('deve retornar temporada por id existente', async () => {
    const req = { params: { id: '3' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.getTemporadaById.mockResolvedValueOnce({ id: 3, nome: 'Temporada 1' });

    await temporadaController.getById(req, res);

    expect(temporadaServiceMocks.getTemporadaById).toHaveBeenCalledWith(3);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 3, nome: 'Temporada 1' });
  });

  it('deve retornar 404 quando temporada não for encontrada em getById', async () => {
    const req = { params: { id: '99' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.getTemporadaById.mockResolvedValueOnce(null);

    await temporadaController.getById(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Temporada não encontrada' });
  });

  it('deve retornar 500 caso getById lance exceção', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.getTemporadaById.mockRejectedValueOnce(new Error('Falha de conexão'));

    await temporadaController.getById(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar temporada' });
  });

  it('deve retornar 400 se animeId for inválido em listByAnimeId', async () => {
    const req = { params: { animeId: 'abc' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await temporadaController.listByAnimeId(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'animeId inválido' });
  });

  it('deve retornar 500 caso listByAnimeId lance exceção', async () => {
    const req = { params: { animeId: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.listTemporadasByAnimeId.mockRejectedValueOnce(new Error('Erro interno'));

    await temporadaController.listByAnimeId(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar temporadas' });
  });
});