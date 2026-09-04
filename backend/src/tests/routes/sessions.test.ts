import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const {
  sessaoFindManyMock,
  sessaoFindUniqueMock,
  sessaoUpdateManyMock,
} = vi.hoisted(() => ({
  sessaoFindManyMock: vi.fn(),
  sessaoFindUniqueMock: vi.fn(),
  sessaoUpdateManyMock: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    sessao: {
      findMany: sessaoFindManyMock,
      findUnique: sessaoFindUniqueMock,
      updateMany: sessaoUpdateManyMock,
    },
  },
}));

vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: { headers: Record<string, string | undefined>; user?: UsuarioAutenticado }, res: { status: (code: number) => { json: (body: unknown) => unknown } }, next: () => void) => {
    const header = req.headers.authorization;

    if (!header) {
      res.status(401).json({ message: 'Token de autenticação não fornecido' });
      return;
    }

    if (header === 'Bearer admin-token') {
      req.user = { id: 99, role: 'ADMIN', email: 'admin@teste.com', nome: 'Admin' };
      next();
      return;
    }

    if (header === 'Bearer user-1-token') {
      req.user = { id: 1, role: 'USER', email: 'user1@teste.com', nome: 'User 1' };
      next();
      return;
    }

    if (header === 'Bearer user-2-token') {
      req.user = { id: 2, role: 'USER', email: 'user2@teste.com', nome: 'User 2' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('Rotas de sessões', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar listagem de sessões sem usuarioId na query', async () => {
    const response = await request(app)
      .get('/auth/sessions')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'usuarioId é obrigatório como query param',
    });
    expect(sessaoFindManyMock).not.toHaveBeenCalled();
  });

  it('deve bloquear listagem de sessões de outro usuário', async () => {
    const response = await request(app)
      .get('/auth/sessions')
      .query({ usuarioId: '2' })
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(sessaoFindManyMock).not.toHaveBeenCalled();
  });

  it('deve listar sessões do próprio usuário', async () => {
    const agora = new Date('2026-09-03T10:00:00.000Z');
    sessaoFindManyMock.mockResolvedValueOnce([
      {
        id: 10,
        usuarioId: 1,
        refreshTokenHash: 'hash',
        dispositivo: 'Chrome',
        ip: '127.0.0.1',
        userAgent: 'Vitest',
        expiraEm: agora,
        revogadoEm: null,
        criadoEm: agora,
      },
    ]);

    const response = await request(app)
      .get('/auth/sessions')
      .query({ usuarioId: '1' })
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OK');
    expect(response.body.sessions).toHaveLength(1);
    expect(sessaoFindManyMock).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
      orderBy: { id: 'desc' },
    });
  });

  it('deve permitir que admin liste sessões de outro usuário', async () => {
    sessaoFindManyMock.mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/auth/sessions')
      .query({ usuarioId: '2' })
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OK', sessions: [] });
    expect(sessaoFindManyMock).toHaveBeenCalledWith({
      where: { usuarioId: 2 },
      orderBy: { id: 'desc' },
    });
  });

  it('deve retornar 400 quando sessionId for inválido', async () => {
    const response = await request(app)
      .delete('/auth/sessions/abc')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'sessionId inválido' });
    expect(sessaoFindUniqueMock).not.toHaveBeenCalled();
  });

  it('deve impedir revogação de sessão de outro usuário', async () => {
    sessaoFindUniqueMock.mockResolvedValueOnce({
      id: 12,
      usuarioId: 2,
      revogadoEm: null,
    });

    const response = await request(app)
      .delete('/auth/sessions/12')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(sessaoUpdateManyMock).not.toHaveBeenCalled();
  });

  it('deve revogar a própria sessão', async () => {
    sessaoFindUniqueMock.mockResolvedValueOnce({
      id: 15,
      usuarioId: 1,
      revogadoEm: null,
    });
    sessaoUpdateManyMock.mockResolvedValueOnce({ count: 1 });

    const response = await request(app)
      .delete('/auth/sessions/15')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(204);
    expect(sessaoUpdateManyMock).toHaveBeenCalledTimes(1);
    expect(sessaoUpdateManyMock).toHaveBeenCalledWith({
      where: { id: 15, revogadoEm: null },
      data: { revogadoEm: expect.any(Date) },
    });
  });

  it('deve permitir que admin revogue sessão de outro usuário', async () => {
    sessaoFindUniqueMock.mockResolvedValueOnce({
      id: 20,
      usuarioId: 2,
      revogadoEm: null,
    });
    sessaoUpdateManyMock.mockResolvedValueOnce({ count: 1 });

    const response = await request(app)
      .delete('/auth/sessions/20')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(204);
    expect(sessaoUpdateManyMock).toHaveBeenCalledWith({
      where: { id: 20, revogadoEm: null },
      data: { revogadoEm: expect.any(Date) },
    });
  });
});
