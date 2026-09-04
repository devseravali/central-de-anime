import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const personagemServiceMocks = vi.hoisted(() => ({
  listPersonagens: vi.fn(),
  listPersonagensByAnimeId: vi.fn(),
  getPersonagemById: vi.fn(),
}));

vi.mock('../../services/personagemService', () => ({
  personagemService: personagemServiceMocks,
}));

import { personagemController } from '../../controllers/personagemController';

type MockResponse = {
  res: Response;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function criarResponse(): MockResponse {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('personagemController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('deve listar todos os personagens quando animeId não for informado', async () => {
      const req = { query: {} } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagens.mockResolvedValueOnce([
        { id: 1, nome: 'Monkey D. Luffy' },
      ]);

      await personagemController.list(req, res);

      expect(personagemServiceMocks.listPersonagens).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith([{ id: 1, nome: 'Monkey D. Luffy' }]);
    });

    it('deve listar personagens filtrando por animeId válido na query', async () => {
      const req = { query: { animeId: '10' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagensByAnimeId.mockResolvedValueOnce([
        { id: 2, nome: 'Roronoa Zoro' },
      ]);

      await personagemController.list(req, res);

      expect(personagemServiceMocks.listPersonagensByAnimeId).toHaveBeenCalledWith(10);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith([{ id: 2, nome: 'Roronoa Zoro' }]);
    });

    it('deve listar todos se animeId na query for vazio ou não numérico', async () => {
      const req = { query: { animeId: 'abc' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagens.mockResolvedValueOnce([]);

      await personagemController.list(req, res);

      expect(personagemServiceMocks.listPersonagens).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(200);
    });

    it('deve retornar status 500 caso o serviço falhe na listagem', async () => {
      const req = { query: {} } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagens.mockRejectedValueOnce(
        new Error('Erro de banco')
      );

      await personagemController.list(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Erro ao listar personagens',
      });
    });
  });

  describe('listByAnimeId', () => {
    it('deve rejeitar requisição com animeId ausente ou não numérico', async () => {
      const req = { params: { animeId: 'invalido' } } as unknown as Request;
      const { res, status, json } = criarResponse();

      await personagemController.listByAnimeId(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ message: 'animeId inválido' });
      expect(personagemServiceMocks.listPersonagensByAnimeId).not.toHaveBeenCalled();
    });

    it('deve listar personagens quando animeId for fornecido em params.animeId', async () => {
      const req = { params: { animeId: '5' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagensByAnimeId.mockResolvedValueOnce([
        { id: 3, nome: 'Nami' },
      ]);

      await personagemController.listByAnimeId(req, res);

      expect(personagemServiceMocks.listPersonagensByAnimeId).toHaveBeenCalledWith(5);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith([{ id: 3, nome: 'Nami' }]);
    });

    it('deve listar personagens quando fornecido em params.id como fallback', async () => {
      const req = { params: { id: '7' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagensByAnimeId.mockResolvedValueOnce([]);

      await personagemController.listByAnimeId(req, res);

      expect(personagemServiceMocks.listPersonagensByAnimeId).toHaveBeenCalledWith(7);
      expect(status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 500 caso o serviço falhe em listByAnimeId', async () => {
      const req = { params: { animeId: '5' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.listPersonagensByAnimeId.mockRejectedValueOnce(
        new Error('Falha interna')
      );

      await personagemController.listByAnimeId(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ message: 'Erro ao listar personagens' });
    });
  });

  describe('getById', () => {
    it('deve rejeitar requisição com id ausente ou vazio', async () => {
      const req = { params: { id: '   ' } } as unknown as Request;
      const { res, status, json } = criarResponse();

      await personagemController.getById(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ message: 'id inválido' });
    });

    it('deve rejeitar requisição com id não numérico', async () => {
      const req = { params: { id: 'abc' } } as unknown as Request;
      const { res, status, json } = criarResponse();

      await personagemController.getById(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ message: 'id inválido' });
    });

    it('deve retornar 404 quando personagem não for encontrado', async () => {
      const req = { params: { id: '99' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.getPersonagemById.mockResolvedValueOnce(null);

      await personagemController.getById(req, res);

      expect(personagemServiceMocks.getPersonagemById).toHaveBeenCalledWith(99);
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ message: 'Personagem não encontrado' });
    });

    it('deve retornar 200 com os dados do personagem existente', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.getPersonagemById.mockResolvedValueOnce({
        id: 1,
        nome: 'Monkey D. Luffy',
      });

      await personagemController.getById(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ id: 1, nome: 'Monkey D. Luffy' });
    });

    it('deve retornar 500 caso o serviço falhe ao buscar personagem', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const { res, status, json } = criarResponse();
      personagemServiceMocks.getPersonagemById.mockRejectedValueOnce(
        new Error('Erro de conexão')
      );

      await personagemController.getById(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar personagem' });
    });
  });
});
