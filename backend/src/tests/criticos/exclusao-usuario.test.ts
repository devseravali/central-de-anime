import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const prismaMocks = vi.hoisted(() => ({
  usuarioDelete: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      delete: prismaMocks.usuarioDelete,
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

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('P0-02 - Exclusão de usuário', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve negar exclusão sem autenticação', async () => {
    const response = await request(app).delete('/usuario/1');
    expect(response.status).toBe(401);
  });

  it('deve bloquear exclusão de outro usuário por usuário comum', async () => {
    const response = await request(app)
      .delete('/usuario/2')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(prismaMocks.usuarioDelete).not.toHaveBeenCalled();
  });

  it('deve permitir que o próprio usuário se exclua', async () => {
    prismaMocks.usuarioDelete.mockResolvedValueOnce({ id: 1 });

    const response = await request(app)
      .delete('/usuario/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(204);
    expect(prismaMocks.usuarioDelete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('deve permitir que admin exclua outro usuário', async () => {
    prismaMocks.usuarioDelete.mockResolvedValueOnce({ id: 2 });

    const response = await request(app)
      .delete('/usuario/2')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(204);
    expect(prismaMocks.usuarioDelete).toHaveBeenCalledWith({ where: { id: 2 } });
  });
});
