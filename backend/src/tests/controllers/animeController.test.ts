import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const animeServiceMocks = vi.hoisted(() => ({
  listAnimes: vi.fn(),
  searchAnimes: vi.fn(),
  getAnimeById: vi.fn(),
  getAnimeWithCache: vi.fn(),
  updateAnime: vi.fn(),
  deleteAnime: vi.fn(),
  createAnime: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock('../../services/animeService', () => ({ animeService: animeServiceMocks }));
vi.mock('../../config/prisma', () => ({ prisma: { $queryRaw: prismaMocks.queryRaw } }));

import { animeController } from '../../controllers/animeController';

function criarResponse() {
  const json = vi.fn();
  const send = vi.fn();
  const status = vi.fn(() => ({ json, send }));
  return { res: { status, json, send } as unknown as Response, status, json, send };
}

describe('animeController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve listar animes com filtros convertidos', async () => {
    const req = { query: { page: '2', perPage: '5', titulo: 'Naruto', generoId: '4', statusId: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.listAnimes.mockResolvedValueOnce({ items: [], total: 0, page: 2, perPage: 5 });

    await animeController.list(req, res);

    expect(animeServiceMocks.listAnimes).toHaveBeenCalledWith({ page: 2, perPage: 5, titulo: 'Naruto', generoId: 4, statusId: 1 });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ items: [], total: 0, page: 2, perPage: 5 });
  });

  it('deve exigir parâmetro de busca', async () => {
    const req = { query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await animeController.search(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Parâmetro de busca é obrigatório' });
  });

  it('deve usar busca com cache quando relations=true', async () => {
    const req = { params: { id: '10' }, query: { relations: 'true' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.getAnimeWithCache.mockResolvedValueOnce({ id: 10 });

    await animeController.getById(req, res);

    expect(animeServiceMocks.getAnimeWithCache).toHaveBeenCalledWith(10);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 10 });
  });

  it('deve retornar 404 para anime inexistente', async () => {
    const req = { params: { id: '10' }, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.getAnimeById.mockResolvedValueOnce(null);

    await animeController.getById(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Anime não encontrado' });
  });

  it('deve responder 409 com anime existente em caso de duplicidade na criação', async () => {
    const req = { body: { titulo: 'Naruto' } } as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.createAnime.mockRejectedValueOnce(new Error('Anime já existe'));
    prismaMocks.queryRaw.mockResolvedValueOnce([{ id: 1, titulo: 'Naruto' }]);

    await animeController.create(req, res);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Anime já existe', existing: { id: 1, titulo: 'Naruto' } });
  });

  it('deve retornar status 500 caso a listagem de animes lance exceção', async () => {
    const req = { query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.listAnimes.mockRejectedValueOnce(new Error('Falha no banco'));

    await animeController.list(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar animes' });
  });

  it('deve buscar animes com parâmetro query e limites customizados', async () => {
    const req = { query: { query: 'Dragon', limit: '10', page: '2' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.searchAnimes.mockResolvedValueOnce({
      items: [{ id: 1, titulo: 'Dragon Ball' }],
      total: 1,
      page: 2,
      perPage: 10,
    });

    await animeController.search(req, res);

    expect(animeServiceMocks.searchAnimes).toHaveBeenCalledWith('Dragon', 10, 2);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }));
  });

  it('deve retornar 500 caso a busca lance exceção', async () => {
    const req = { query: { q: 'Bleach' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.searchAnimes.mockRejectedValueOnce(new Error('Erro de busca'));

    await animeController.search(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar animes' });
  });

  it('deve rejeitar getById quando id de anime for inválido ou ausente', async () => {
    const req = { params: { id: 'invalido' }, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await animeController.getById(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de anime inválido' });
  });

  it('deve buscar anime sem relações quando relations for false ou ausente', async () => {
    const req = { params: { id: '5' }, query: { relations: 'false' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.getAnimeById.mockResolvedValueOnce({ id: 5, titulo: 'Hunter x Hunter' });

    await animeController.getById(req, res);

    expect(animeServiceMocks.getAnimeById).toHaveBeenCalledWith(5);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 5, titulo: 'Hunter x Hunter' });
  });

  it('deve retornar 400 com mensagem quando getById capturar exceção', async () => {
    const req = { params: { id: '5' }, query: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.getAnimeById.mockRejectedValueOnce(new Error('Falha interna'));

    await animeController.getById(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Falha interna' });
  });

  it('deve rejeitar update quando id for inválido', async () => {
    const req = { params: { id: 'abc' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await animeController.update(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de anime inválido' });
  });

  it('deve atualizar anime com sucesso', async () => {
    const req = { params: { id: '1' }, body: { titulo: 'One Piece Red' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.updateAnime.mockResolvedValueOnce({ id: 1, titulo: 'One Piece Red' });

    await animeController.update(req, res);

    expect(animeServiceMocks.updateAnime).toHaveBeenCalledWith(1, { titulo: 'One Piece Red' });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 1, titulo: 'One Piece Red' });
  });

  it('deve retornar 400 quando update lançar exceção', async () => {
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.updateAnime.mockRejectedValueOnce(new Error('Anime não encontrado'));

    await animeController.update(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Anime não encontrado' });
  });

  it('deve rejeitar remove quando id for inválido', async () => {
    const req = { params: { id: 'xyz' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await animeController.remove(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de anime inválido' });
  });

  it('deve remover anime e responder 204', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status, send } = criarResponse();
    animeServiceMocks.deleteAnime.mockResolvedValueOnce(undefined);

    await animeController.remove(req, res);

    expect(animeServiceMocks.deleteAnime).toHaveBeenCalledWith(1);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve retornar 400 quando remove lançar exceção', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.deleteAnime.mockRejectedValueOnce(new Error('Anime não encontrado'));

    await animeController.remove(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Anime não encontrado' });
  });

  it('deve criar anime e retornar 201', async () => {
    const req = { body: { titulo: 'Novo Anime' } } as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.createAnime.mockResolvedValueOnce({ id: 99, titulo: 'Novo Anime' });

    await animeController.create(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ id: 99, titulo: 'Novo Anime' });
  });

  it('deve responder 400 para erro genérico na criação de anime', async () => {
    const req = { body: { titulo: 'Incompleto' } } as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.createAnime.mockRejectedValueOnce(new Error('Campo "titulo" é obrigatório'));

    await animeController.create(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Campo "titulo" é obrigatório' });
  });

  it('deve responder 409 mesmo se consulta ao banco por duplicidade falhar', async () => {
    const req = { body: { titulo: 'Duplicado' } } as Request;
    const { res, status, json } = criarResponse();
    animeServiceMocks.createAnime.mockRejectedValueOnce(new Error('Anime já existe'));
    prismaMocks.queryRaw.mockRejectedValueOnce(new Error('Erro de banco'));

    await animeController.create(req, res);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Anime já existe' });
  });
});