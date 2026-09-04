import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  usuarioFindUnique: vi.fn(),
}));

const jwtMocks = vi.hoisted(() => ({
  verify: vi.fn(),
}));

const authServiceMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: prismaMocks.usuarioFindUnique,
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtMocks.verify },
  verify: jwtMocks.verify,
}));

vi.mock('../../services/authService', () => ({
  authService: authServiceMocks,
}));

import { authMiddleware } from '../../middlewares/authMiddleware';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const setHeader = vi.fn();
  return { res: { status, setHeader } as unknown as Response, status, json, setHeader };
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exigir header Authorization', async () => {
    const req = { headers: {} } as Request;
    const { res, status, json } = criarResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Token de autenticação não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar formato inválido do header', async () => {
    const req = { headers: { authorization: 'Token abc' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Formato do token inválido' });
  });

  it('deve rejeitar token que não parece JWT', async () => {
    const req = { headers: { authorization: 'Bearer refresh-token' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      message: 'Formato do token inválido: espere um access token JWT (não use o refreshToken)',
    });
  });

  it('deve autenticar usuário válido e preencher req.user', async () => {
    jwtMocks.verify.mockReturnValueOnce({ sub: '7' });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 7,
      email: 'user@teste.com',
      nome: 'Usuário',
      admin: null,
    });
    const req = { headers: { authorization: 'Bearer a.b.c' } } as unknown as Request;
    const { res } = criarResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      id: 7,
      email: 'user@teste.com',
      nome: 'Usuário',
      role: 'USER',
    });
  });

  it('deve tentar refresh quando access token estiver expirado', async () => {
    const erro = new Error('jwt expired');
    Object.assign(erro, { name: 'TokenExpiredError' });
    jwtMocks.verify.mockImplementationOnce(() => {
      throw erro;
    });
    authServiceMocks.refresh.mockResolvedValueOnce({
      accessToken: 'novo-access',
      refreshToken: 'novo-refresh',
      user: { id: 9 },
    });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 9,
      email: 'admin@teste.com',
      nome: 'Admin',
      admin: { id: 1 },
    });
    const req = {
      headers: { authorization: 'Bearer a.b.c', 'x-refresh-token': '1.refresh' },
    } as unknown as Request;
    const { res, setHeader } = criarResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(authServiceMocks.refresh).toHaveBeenCalledWith('1.refresh');
    expect(setHeader).toHaveBeenCalledWith('x-access-token', 'novo-access');
    expect(setHeader).toHaveBeenCalledWith('x-refresh-token', 'novo-refresh');
    expect(req.user?.role).toBe('ADMIN');
    expect(next).toHaveBeenCalledTimes(1);
  });
});