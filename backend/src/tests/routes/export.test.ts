import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const prismaMocks = vi.hoisted(() => ({
  usuarioFindUnique: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: prismaMocks.usuarioFindUnique,
    },
  },
}));

vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (
    req: { headers: Record<string, string | undefined>; user?: UsuarioAutenticado },
    res: { status: (code: number) => { json: (body: unknown) => unknown } },
    next: () => void
  ) => {
    const header = req.headers.authorization;

    if (!header) {
      res.status(401).json({ message: 'Token de autenticação não fornecido' });
      return;
    }

    if (header === 'Bearer user-1-token') {
      req.user = { id: 1, role: 'USER', email: 'user1@teste.com', nome: 'User 1' };
      next();
      return;
    }

    if (header === 'Bearer admin-token') {
      req.user = { id: 99, role: 'ADMIN', email: 'admin@teste.com', nome: 'Admin' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('Rotas de exportação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exigir autenticação para exportar usuário', async () => {
    const response = await request(app).get('/export/usuarios/1');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token de autenticação não fornecido' });
  });

  it('deve rejeitar id inválido antes de consultar o banco', async () => {
    const response = await request(app)
      .get('/export/usuarios/abc')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Dados de entrada inválidos',
      errors: [
        {
          field: 'params.id',
          message: 'Invalid input: expected number, received NaN',
        },
      ],
    });
    expect(prismaMocks.usuarioFindUnique).not.toHaveBeenCalled();
  });

  it('deve impedir exportação de outro usuário sem privilégio administrativo', async () => {
    const response = await request(app)
      .get('/export/usuarios/2')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(prismaMocks.usuarioFindUnique).not.toHaveBeenCalled();
  });

  it('deve retornar 404 quando o usuário não existir', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/export/usuarios/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Usuário não encontrado' });
  });

  it('deve exportar somente campos seguros do próprio usuário', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      nome: 'User 1',
      email: 'user1@teste.com',
      avatar: 'avatar.png',
      status: 'ativo',
      criadoEm: '2026-01-01T00:00:00.000Z',
      atualizadoEm: '2026-01-02T00:00:00.000Z',
      senha: 'hash',
      resetSenhaTokenHash: 'secret',
      resetSenhaExpiraEm: 'secret',
      sessoes: [{ id: 10 }],
    });

    const response = await request(app)
      .get('/export/usuarios/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      usuario: {
        id: 1,
        nome: 'User 1',
        email: 'user1@teste.com',
        avatar: 'avatar.png',
        status: 'ativo',
        criadoEm: '2026-01-01T00:00:00.000Z',
        atualizadoEm: '2026-01-02T00:00:00.000Z',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('senha');
    expect(JSON.stringify(response.body)).not.toContain('resetSenhaTokenHash');
  });

  it('deve permitir exportação administrativa de outro usuário', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 2,
      nome: 'User 2',
      email: 'user2@teste.com',
      avatar: null,
      status: 'ativo',
      criadoEm: '2026-01-01T00:00:00.000Z',
      atualizadoEm: '2026-01-02T00:00:00.000Z',
    });

    const response = await request(app)
      .get('/export/usuarios/2')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(prismaMocks.usuarioFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 2 } })
    );
  });

  it('deve mascarar falha interna ao exportar usuário', async () => {
    prismaMocks.usuarioFindUnique.mockRejectedValueOnce(new Error('db down'));

    const response = await request(app)
      .get('/export/usuarios/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao exportar usuário' });
  });
});
