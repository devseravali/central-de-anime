import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const interacaoServiceMocks = vi.hoisted(() => ({
  favoritarAnime: vi.fn(),
  desfavoritarAnime: vi.fn(),
  favoritarPersonagem: vi.fn(),
  desfavoritarPersonagem: vi.fn(),
  darNota: vi.fn(),
  removerNota: vi.fn(),
}));

vi.mock('../../services/interacaoService', () => ({ interacaoService: interacaoServiceMocks }));

import { interacaoController } from '../../controllers/interacaoController';

function criarResponse() {
  const json = vi.fn();
  const send = vi.fn();
  const status = vi.fn(() => ({ json, send }));
  return { res: { status, json, send } as unknown as Response, status, json, send };
}

describe('interacaoController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve favoritar anime usando usuário autenticado', async () => {
    const req = { user: { id: 1 }, params: { animeId: '2' } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.favoritarAnime(req, res);

    expect(interacaoServiceMocks.favoritarAnime).toHaveBeenCalledWith(1, 2);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve rejeitar ids ausentes ao desfavoritar personagem', async () => {
    const req = { params: { personagemId: '' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.desfavoritarPersonagem(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId e personagemId são obrigatórios' });
  });

  it('deve propagar erro conhecido de nota inválida', async () => {
    const req = { user: { id: 1 }, params: { animeId: '4' }, body: { nota: 11 } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.darNota.mockRejectedValueOnce(new Error('A nota deve estar entre 0 e 10'));

    await interacaoController.darNota(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'A nota deve estar entre 0 e 10' });
  });

  it('deve remover nota com sucesso', async () => {
    const req = { user: { id: 2 }, params: { animeId: '7' } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.removerNota(req, res);

    expect(interacaoServiceMocks.removerNota).toHaveBeenCalledWith(2, 7);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve rejeitar favoritarAnime quando usuarioId ou animeId for indefinido', async () => {
    const req = { user: undefined, params: { animeId: '' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.favoritarAnime(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId e animeId são obrigatórios' });
  });

  it('deve retornar 500 caso favoritarAnime lance exceção', async () => {
    const req = { user: { id: 1 }, params: { animeId: '2' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.favoritarAnime.mockRejectedValueOnce(new Error('Erro de banco'));

    await interacaoController.favoritarAnime(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao favoritar anime' });
  });

  it('deve desfavoritar anime com sucesso', async () => {
    const req = { user: { id: 1 }, params: { animeId: '3' } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.desfavoritarAnime(req, res);

    expect(interacaoServiceMocks.desfavoritarAnime).toHaveBeenCalledWith(1, 3);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve rejeitar desfavoritarAnime quando parâmetros forem indefinidos', async () => {
    const req = { user: undefined, params: {}, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.desfavoritarAnime(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId e animeId são obrigatórios' });
  });

  it('deve retornar 500 caso desfavoritarAnime lance exceção', async () => {
    const req = { user: { id: 1 }, params: { animeId: '3' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.desfavoritarAnime.mockRejectedValueOnce(new Error('Erro de banco'));

    await interacaoController.desfavoritarAnime(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao desfavoritar anime' });
  });

  it('deve favoritar personagem com sucesso', async () => {
    const req = { user: { id: 2 }, params: { personagemId: '5' } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.favoritarPersonagem(req, res);

    expect(interacaoServiceMocks.favoritarPersonagem).toHaveBeenCalledWith(2, 5);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve rejeitar favoritarPersonagem quando parâmetros forem indefinidos', async () => {
    const req = { user: undefined, params: {}, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.favoritarPersonagem(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId e personagemId são obrigatórios' });
  });

  it('deve retornar 500 caso favoritarPersonagem lance exceção', async () => {
    const req = { user: { id: 2 }, params: { personagemId: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.favoritarPersonagem.mockRejectedValueOnce(new Error('Erro interno'));

    await interacaoController.favoritarPersonagem(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao favoritar personagem' });
  });

  it('deve desfavoritar personagem com sucesso', async () => {
    const req = { user: { id: 3 }, params: { personagemId: '9' } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.desfavoritarPersonagem(req, res);

    expect(interacaoServiceMocks.desfavoritarPersonagem).toHaveBeenCalledWith(3, 9);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve retornar 500 caso desfavoritarPersonagem lance exceção', async () => {
    const req = { user: { id: 3 }, params: { personagemId: '9' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.desfavoritarPersonagem.mockRejectedValueOnce(new Error('Falha no banco'));

    await interacaoController.desfavoritarPersonagem(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao desfavoritar personagem' });
  });

  it('deve dar nota com sucesso e responder 204', async () => {
    const req = { user: { id: 1 }, params: { animeId: '5' }, body: { nota: 9 } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.darNota(req, res);

    expect(interacaoServiceMocks.darNota).toHaveBeenCalledWith(1, 5, 9);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve aceitar usuarioId via body quando usuário não estiver autenticado via req.user', async () => {
    const req = { user: undefined, params: { animeId: '5' }, body: { usuarioId: '4', nota: 10 } } as unknown as Request;
    const { res, status, send } = criarResponse();

    await interacaoController.darNota(req, res);

    expect(interacaoServiceMocks.darNota).toHaveBeenCalledWith(4, 5, 10);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('deve rejeitar darNota com parâmetros obrigatórios ausentes ou nota NaN', async () => {
    const req = { user: { id: 1 }, params: { animeId: '5' }, body: { nota: 'invalida' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.darNota(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId, animeId e nota são obrigatórios' });
  });

  it('deve rejeitar removerNota quando parâmetros forem indefinidos', async () => {
    const req = { user: undefined, params: {}, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await interacaoController.removerNota(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId e animeId são obrigatórios' });
  });

  it('deve retornar 500 caso removerNota lance exceção', async () => {
    const req = { user: { id: 2 }, params: { animeId: '7' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    interacaoServiceMocks.removerNota.mockRejectedValueOnce(new Error('Erro de remoção'));

    await interacaoController.removerNota(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao remover nota' });
  });
});