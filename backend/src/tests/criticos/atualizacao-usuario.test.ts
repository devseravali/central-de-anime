import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const usuarioServiceMocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
}));

vi.mock('../../services/usuarioService', () => ({
  usuarioService: usuarioServiceMocks,
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

describe('P0-01 - Atualização de usuário', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve negar atualização sem autenticação', async () => {
    const response = await request(app)
      .put('/usuario/1')
      .send({ nome: 'Novo Nome' });

    expect(response.status).toBe(401);
  });

  it('deve bloquear usuário comum ao alterar outro usuário', async () => {
    const response = await request(app)
      .put('/usuario/2')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'x' });

    expect(response.status).toBe(403);
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve permitir que admin atualize outro usuário', async () => {
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 2, nome: 'Atualizado pelo admin' });

    const response = await request(app)
      .put('/usuario/2')
      .set('Authorization', 'Bearer admin-token')
      .send({ nome: 'Atualizado pelo admin' });

    expect(response.status).toBe(200);
    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(2, { nome: 'Atualizado pelo admin' });
  });

  it('deve rejeitar id inválido na atualização', async () => {
    const response = await request(app)
      .put('/usuario/abc')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'x' });

    expect(response.status).toBe(400);
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });
});
