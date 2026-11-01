import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  sessaoFindUnique: vi.fn(),
}));
const authServiceMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: { sessao: { findUnique: prismaMocks.sessaoFindUnique } },
}));
vi.mock('../../services/authService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../services/authService')>();
  return { ...original, authService: authServiceMocks };
});

import { authMiddleware } from '../../middlewares/authMiddleware';

const secret = process.env.JWT_SECRET!;
const token = (payload: object = { sub: '7', sid: 5 }, expiresIn = 60) =>
  jwt.sign(payload, secret, { expiresIn });
const session = (overrides = {}) => ({
  usuarioId: 7,
  expiraEm: new Date(Date.now() + 60_000),
  revogadoEm: null,
  usuario: {
    id: 7,
    email: 'user@teste.com',
    nome: 'Usuário',
    status: 'ativo',
    admin: null,
  },
  ...overrides,
});

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const setHeader = vi.fn();
  return { res: { status, setHeader } as unknown as Response, status, json, setHeader };
}

const request = (accessToken: string, refreshToken?: string): Request => ({
  headers: {
    authorization: `Bearer ${accessToken}`,
    ...(refreshToken ? { 'x-refresh-token': refreshToken } : {}),
  },
} as Request);

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('deve exigir header Authorization', async () => {
    const { res, status, json } = criarResponse();
    const next = vi.fn();

    await authMiddleware({ headers: {} } as Request, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Token de autenticação não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar formato inválido do header', async () => {
    const { res, status, json } = criarResponse();
    const next = vi.fn();

    await authMiddleware({ headers: { authorization: 'Token abc' } } as Request, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Formato do token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar token que não parece JWT', async () => {
    const { res, status, json } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request('5.refresh'), res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      message: 'Formato do token inválido: espere um access token JWT (não use o refreshToken)',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve autenticar usuário válido e preencher req.user', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(session());
    const req = request(token());
    const { res, setHeader } = criarResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(setHeader).not.toHaveBeenCalled();
    expect(prismaMocks.sessaoFindUnique).toHaveBeenCalledTimes(1);
    expect(prismaMocks.sessaoFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    );
    expect(req.user).toEqual({
      id: 7,
      email: 'user@teste.com',
      nome: 'Usuário',
      role: 'USER',
    });
  });

  it('deve bloquear token de usuário inativo', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(
      session({ usuario: { ...session().usuario, status: 'bloqueado' } })
    );
    const { res, status, json } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request(token()), res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar JWT expirado sem renovar mesmo com refresh no header', async () => {
    const req = request(token(undefined, -1), '5.refresh');
    const { res, status, setHeader } = criarResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
    expect(prismaMocks.sessaoFindUnique).not.toHaveBeenCalled();
    expect(setHeader).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['inexistente', null],
    ['revogada', session({ revogadoEm: new Date() })],
    ['expirada', session({ expiraEm: new Date(Date.now() - 1000) })],
    ['de outro usuário', session({ usuarioId: 8 })],
    ['sem usuário', session({ usuario: null })],
  ])('deve rejeitar JWT válido com sessão %s', async (_name, sessao) => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(sessao);
    const req = request(token());
    const { res, status, json } = criarResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it.each([
    { sub: '7' },
    { sub: '7', sid: '5' },
    { sub: '7', sid: 0 },
    { sub: '7', sid: -5 },
    { sub: '7', sid: 1.5 },
    { sub: '7', sid: Number.MAX_SAFE_INTEGER + 1 },
    { sub: 'invalid', sid: 5 },
    { sub: '0', sid: 5 },
    { sub: '-7', sid: 5 },
    { sub: '1.5', sid: 5 },
    { sub: String(Number.MAX_SAFE_INTEGER + 1), sid: 5 },
    { sid: 5 },
  ])('deve rejeitar claims inválidas sem consultar banco: %j', async (payload) => {
    const { res, status } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request(token(payload)), res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(prismaMocks.sessaoFindUnique).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['expirado', () => token(undefined, -1)],
    ['assinatura incorreta', () => jwt.sign({ sub: '7', sid: 5 }, 'outra-chave')],
    ['adulterado', () => `${token().split('.').slice(0, 2).join('.')}.assinatura-invalida`],
    ['payload textual', () => jwt.sign('payload-invalido', secret)],
    ['sem expiração', () => jwt.sign({ sub: '7', sid: 5 }, secret)],
  ])('deve rejeitar JWT %s', async (_name, criarToken) => {
    const { res, status } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request(criarToken()), res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(prismaMocks.sessaoFindUnique).not.toHaveBeenCalled();
  });

  it('deve rejeitar JWT antigo expirado sem sid mesmo com refresh disponível', async () => {
    const { res, status } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request(token({ sub: '7' }, -1), '5.refresh'), res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ['inexistente', null],
    ['revogada', session({ revogadoEm: new Date() })],
    ['expirada', session({ expiraEm: new Date(Date.now() - 1000) })],
    ['de outro usuário', session({ usuarioId: 8 })],
  ])('JWT válido deve rejeitar sessão %s mesmo com cookie de refresh', async (_name, sessao) => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(sessao);
    const req = {
      headers: { authorization: `Bearer ${token()}` },
      cookies: { refreshToken: '5.refresh' },
    } as Request;
    const { res, status, setHeader } = criarResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(setHeader).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    () => jwt.sign({ sub: '7', sid: 6 }, 'outra-chave'),
    () => token({ sub: '7' }),
    () => token({ sub: '7', sid: 6 }, -1),
  ])('deve rejeitar JWT inválido mesmo com refresh disponível', async (novoToken) => {
    const { res, status, setHeader } = criarResponse();
    const next = vi.fn();

    await authMiddleware(request(novoToken(), '5.refresh'), res, next);

    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(prismaMocks.sessaoFindUnique).not.toHaveBeenCalled();
    expect(setHeader).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['sem refresh', 'refresh no header', 'refresh no cookie'])(
    'deve retornar 500 e não expor detalhes de infraestrutura: %s',
    async (etapa) => {
      const falha = new Error('Detalhe interno de conexão Prisma');
      prismaMocks.sessaoFindUnique.mockRejectedValueOnce(falha);
      const { res, status, json, setHeader } = criarResponse();
      const next = vi.fn();

      const req = request(token(), etapa === 'refresh no header' ? '5.refresh' : undefined);
      if (etapa === 'refresh no cookie') req.cookies = { refreshToken: '5.refresh' };
      await authMiddleware(req, res, next);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(console.error).toHaveBeenCalledWith('Falha de infraestrutura ao autenticar sessão');
      expect(setHeader).not.toHaveBeenCalled();
      expect(authServiceMocks.refresh).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    }
  );

  it('deve rejeitar JWT expirado sem consumir refresh presente em cookies', async () => {
    const { res, status, setHeader } = criarResponse();
    const next = vi.fn();

    const req = request(token(undefined, -1));
    req.cookies = { refreshToken: '5.refresh' };
    await authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
    expect(prismaMocks.sessaoFindUnique).not.toHaveBeenCalled();
    expect(setHeader).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
