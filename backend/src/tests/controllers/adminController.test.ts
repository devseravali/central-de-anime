import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const usuarioServiceMocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  promoteToAdmin: vi.fn(),
}));

vi.mock('../../services/usuarioService', () => ({
  usuarioService: usuarioServiceMocks,
}));

import { adminController } from '../../controllers/adminController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('adminController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve informar que listagem ainda não foi implementada', async () => {
    const { res, status, json } = criarResponse();

    await adminController.listUsers({} as Request, res);

    expect(status).toHaveBeenCalledWith(501);
    expect(json).toHaveBeenCalledWith({
      message: 'Not implemented: falta um método de listagem no UsuarioService',
    });
  });

  it('deve rejeitar id inválido ao banir usuário', async () => {
    const req = { params: { id: 'abc' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await adminController.banUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve banir usuário com status banido', async () => {
    const req = { params: { id: '10' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 10, status: 'banido' });

    await adminController.banUser(req, res);

    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(10, { status: 'banido' });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 10, status: 'banido' });
  });

  it('deve desbanir usuário com status ativo', async () => {
    const req = { params: { id: '10' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 10, status: 'ativo' });

    await adminController.unbanUser(req, res);

    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(10, { status: 'ativo' });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 10, status: 'ativo' });
  });

  it('deve promover usuário com nível do body', async () => {
    const req = { params: { id: '7' }, body: { nivel: 'owner' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await adminController.promoteUser(req, res);

    expect(usuarioServiceMocks.promoteToAdmin).toHaveBeenCalledWith(7, 'owner');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Usuário promovido a admin',
      usuarioId: 7,
      nivel: 'owner',
    });
  });

  it('deve retornar 400 caso banUser lance exceção no serviço', async () => {
    const req = { params: { id: '10' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Usuário não encontrado'));

    await adminController.banUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
  });

  it('deve rejeitar id inválido ao desbanir usuário', async () => {
    const req = { params: { id: 'invalido' } } as unknown as Request;
    const { res, status, json } = criarResponse();

    await adminController.unbanUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve retornar 400 caso unbanUser lance exceção no serviço', async () => {
    const req = { params: { id: '10' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Erro ao desbanir'));

    await adminController.unbanUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao desbanir' });
  });

  it('deve rejeitar promoteUser quando id for inválido', async () => {
    const req = { params: { id: '' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await adminController.promoteUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'ID de usuário inválido' });
  });

  it('deve promover usuário mesmo sem nível explícito no body', async () => {
    const req = { params: { id: '8' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.promoteToAdmin.mockResolvedValueOnce(undefined);

    await adminController.promoteUser(req, res);

    expect(usuarioServiceMocks.promoteToAdmin).toHaveBeenCalledWith(8, undefined);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 8 }));
  });

  it('deve retornar 400 caso promoteUser lance exceção no serviço', async () => {
    const req = { params: { id: '99' }, body: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    usuarioServiceMocks.promoteToAdmin.mockRejectedValueOnce(new Error('Usuário inexistente'));

    await adminController.promoteUser(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Usuário inexistente' });
  });
});