import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const episodioServiceMocks = vi.hoisted(() => ({
  listEpisodios: vi.fn(),
  listEpisodiosByTemporadaId: vi.fn(),
  listEpisodiosByAnimeId: vi.fn(),
  getEpisodioById: vi.fn(),
}));

const temporadaServiceMocks = vi.hoisted(() => ({
  getTemporadaById: vi.fn(),
  findTemporadaByAnimeAndSeasonNumber: vi.fn(),
}));

vi.mock('../../services/episodioService', () => ({ episodioService: episodioServiceMocks }));
vi.mock('../../services/temporadaService', () => ({ temporadaService: temporadaServiceMocks }));

import { episodioController } from '../../controllers/episodioController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('episodioController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve listar episódios gerais quando não houver filtros', async () => {
    const req = { params: {}, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.listEpisodios.mockResolvedValueOnce([]);

    await episodioController.list(req, res);

    expect(episodioServiceMocks.listEpisodios).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([]);
  });

  it('deve retornar 404 quando temporada informada não existir', async () => {
    const req = { params: { temporadaId: '5' }, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.getTemporadaById.mockResolvedValueOnce(null);

    await episodioController.list(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Temporada não encontrada' });
  });

  it('deve retornar 400 para id inválido no getById', async () => {
    const req = { params: { id: '' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await episodioController.getById(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de episódio inválido' });
  });

  it('deve listar episódios por anime e número da temporada', async () => {
    const req = { params: { id: '2', seasonNumber: '3' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.findTemporadaByAnimeAndSeasonNumber.mockResolvedValueOnce({ id: 8 });
    episodioServiceMocks.listEpisodiosByTemporadaId.mockResolvedValueOnce([{ id: 1 }]);

    await episodioController.listByAnimeAndSeasonNumber(req, res);

    expect(episodioServiceMocks.listEpisodiosByTemporadaId).toHaveBeenCalledWith(8, 2);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('deve listar episódios por temporada quando ela existir', async () => {
    const req = { params: { temporadaId: '3' }, query: { animeId: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.getTemporadaById.mockResolvedValueOnce({ id: 3 });
    episodioServiceMocks.listEpisodiosByTemporadaId.mockResolvedValueOnce([{ id: 10 }]);

    await episodioController.list(req, res);

    expect(episodioServiceMocks.listEpisodiosByTemporadaId).toHaveBeenCalledWith(3, 5);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 10 }]);
  });

  it('deve listar episódios filtrando por animeId quando temporadaId não for informado', async () => {
    const req = { params: {}, query: { animeId: '7' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.listEpisodiosByAnimeId.mockResolvedValueOnce([{ id: 12 }]);

    await episodioController.list(req, res);

    expect(episodioServiceMocks.listEpisodiosByAnimeId).toHaveBeenCalledWith(7);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: 12 }]);
  });

  it('deve retornar status 500 caso a listagem de episódios falhe', async () => {
    const req = { params: {}, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.listEpisodios.mockRejectedValueOnce(new Error('Falha no banco'));

    await episodioController.list(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar episódios' });
  });

  it('deve retornar episódio existente em getById', async () => {
    const req = { params: { id: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.getEpisodioById.mockResolvedValueOnce({ id: 5, titulo: 'Piloto' });

    await episodioController.getById(req, res);

    expect(episodioServiceMocks.getEpisodioById).toHaveBeenCalledWith(5);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 5, titulo: 'Piloto' });
  });

  it('deve retornar 404 quando o episódio não for encontrado em getById', async () => {
    const req = { params: { id: '99' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.getEpisodioById.mockResolvedValueOnce(null);

    await episodioController.getById(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Episódio não encontrado' });
  });

  it('deve retornar 500 caso ocorra erro inesperado em getById', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    episodioServiceMocks.getEpisodioById.mockRejectedValueOnce(new Error('Erro de conexão'));

    await episodioController.getById(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar episódio' });
  });

  it('deve rejeitar listByAnimeAndSeasonNumber quando parâmetros forem inválidos', async () => {
    const req = { params: { id: 'abc', seasonNumber: '' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await episodioController.listByAnimeAndSeasonNumber(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'animeId e seasonNumber são obrigatórios' });
  });

  it('deve retornar 404 se temporada não for encontrada por número', async () => {
    const req = { params: { id: '1', seasonNumber: '99' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.findTemporadaByAnimeAndSeasonNumber.mockResolvedValueOnce(null);

    await episodioController.listByAnimeAndSeasonNumber(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Temporada não encontrada para esse número' });
  });

  it('deve retornar 500 caso listByAnimeAndSeasonNumber lance exceção', async () => {
    const req = { params: { id: '1', seasonNumber: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    temporadaServiceMocks.findTemporadaByAnimeAndSeasonNumber.mockRejectedValueOnce(new Error('Erro interno'));

    await episodioController.listByAnimeAndSeasonNumber(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar episódios' });
  });
});