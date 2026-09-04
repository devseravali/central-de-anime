import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const usuarioServiceMocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  promoteToAdmin: vi.fn(),
}));

const rankingServiceMocks = vi.hoisted(() => ({
  getRankingByUsuarioId: vi.fn(),
  atualizarRanking: vi.fn(),
}));

vi.mock('../../services/usuarioService', () => ({
  usuarioService: usuarioServiceMocks,
}));

vi.mock('../../services/rankingService', () => ({
  rankingService: rankingServiceMocks,
}));

import { usuarioController } from '../../controllers/usuarioController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('usuarioController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar perfil com id inválido', async () => {
    const req = { params: { id: '' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await usuarioController.getProfile(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve retornar 404 quando perfil não existir', async () => {
    const req = { params: { id: '8' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.getProfile.mockResolvedValueOnce(null);

    await usuarioController.getProfile(req, res);

    expect(usuarioServiceMocks.getProfile).toHaveBeenCalledWith(8);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
  });

  it('deve atualizar perfil com campos permitidos', async () => {
    const req = {
      user: { id: 1 },
      params: {},
      body: { nome: 'Novo Nome', email: 'novo@teste.com', avatar: null },
    } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 1, nome: 'Novo Nome' });

    await usuarioController.updateProfile(req, res);

    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(1, {
      nome: 'Novo Nome',
      email: 'novo@teste.com',
      avatar: null,
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ message: 'Perfil atualizado', usuario: { id: 1, nome: 'Novo Nome' } });
  });

  it('deve mapear conflito de email na atualização', async () => {
    const req = {
      user: { id: 1 },
      params: {},
      body: { email: 'duplicado@teste.com' },
    } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Email já em uso'));

    await usuarioController.updateProfile(req, res);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Email já em uso' });
  });

  it('deve promover usuário informado no body', async () => {
    const req = { body: { usuarioId: 5, nivel: 'owner' }, params: {}, user: { id: 1 } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await usuarioController.promoteToAdmin(req, res);

    expect(usuarioServiceMocks.promoteToAdmin).toHaveBeenCalledWith(5, 'owner');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Usuário promovido a admin',
      usuarioId: 5,
      nivel: 'owner',
    });
  });

  it('deve retornar ranking existente quando já houver registro', async () => {
    const req = { user: { id: 7 }, params: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockResolvedValueOnce({ usuarioId: 7, pontos: 100 });

    await usuarioController.ranking(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Ranking carregado',
      ranking: { usuarioId: 7, pontos: 100 },
    });
  });

  it('deve criar ranking quando não existir registro anterior', async () => {
    const req = { user: { id: 7 }, params: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockResolvedValueOnce(null);
    rankingServiceMocks.atualizarRanking.mockResolvedValueOnce({ usuarioId: 7, pontos: 0 });

    await usuarioController.ranking(req, res);

    expect(rankingServiceMocks.atualizarRanking).toHaveBeenCalledWith(7);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Ranking criado',
      ranking: { usuarioId: 7, pontos: 0 },
    });
  });

  it('deve retornar 200 e dados do perfil no getProfile com sucesso', async () => {
    const req = { params: { id: '3' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.getProfile.mockResolvedValueOnce({ id: 3, nome: 'Sanji' });

    await usuarioController.getProfile(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ message: 'Perfil carregado', usuario: { id: 3, nome: 'Sanji' } });
  });

  it('deve retornar 500 para erro inesperado no getProfile', async () => {
    const req = { params: { id: '3' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.getProfile.mockRejectedValueOnce(new Error('Erro de conexão'));

    await usuarioController.getProfile(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar perfil' });
  });

  it('deve rejeitar updateProfile quando usuarioId for inválido', async () => {
    const req = { params: {}, user: undefined, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await usuarioController.updateProfile(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve retornar 404 no updateProfile quando usuário não for encontrado', async () => {
    const req = { user: { id: 99 }, params: {}, body: { nome: 'Novo' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Usuário não encontrado'));

    await usuarioController.updateProfile(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
  });

  it('deve retornar 400 no updateProfile para erro genérico no serviço', async () => {
    const req = { user: { id: 1 }, params: {}, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Dados inválidos'));

    await usuarioController.updateProfile(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Dados inválidos' });
  });

  it('deve proteger o campo status contra alteração indevida no updateProfile', async () => {
    const req = {
      user: { id: 1 },
      params: {},
      body: { nome: 'Nome', status: 'ADMIN_PRIVILEGE' },
    } as unknown as Request;
    const { res, status } = criarResponse();
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 1, nome: 'Nome' });

    await usuarioController.updateProfile(req, res);

    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(1, { nome: 'Nome' });
    expect(status).toHaveBeenCalledWith(200);
  });

  it('deve rejeitar promoteToAdmin quando id de usuário for indefinido', async () => {
    const req = { body: {}, params: {}, user: undefined } as unknown as Request;
    const { res, status, json } = criarResponse();

    await usuarioController.promoteToAdmin(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve retornar 404 no promoteToAdmin se usuário não for encontrado', async () => {
    const req = { body: { usuarioId: 88 }, params: {}, user: undefined } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.promoteToAdmin.mockRejectedValueOnce(new Error('Usuário não encontrado'));

    await usuarioController.promoteToAdmin(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
  });

  it('deve retornar 400 no promoteToAdmin para erro genérico no serviço', async () => {
    const req = { body: { usuarioId: 88 }, params: {}, user: undefined } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.promoteToAdmin.mockRejectedValueOnce(new Error('Erro de permissão'));

    await usuarioController.promoteToAdmin(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Erro de permissão' });
  });

  it('deve rejeitar ranking quando usuarioId for indefinido', async () => {
    const req = { params: {}, user: undefined } as unknown as Request;
    const { res, status, json } = criarResponse();

    await usuarioController.ranking(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve retornar 500 caso busca de ranking lance exceção', async () => {
    const req = { user: { id: 10 }, params: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockRejectedValueOnce(new Error('Falha no banco'));

    await usuarioController.ranking(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar ranking' });
  });
});