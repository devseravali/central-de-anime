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

    if (header === 'Bearer user-1-token') {
      req.user = { id: 1, role: 'USER', email: 'user1@teste.com', nome: 'User 1' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('P1-04 - Mass assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve bloquear tentativa de enviar role e id no endpoint /usuario/me', async () => {
    const payload = { nome: 'x', role: 'ADMIN', id: 999 };
    const response = await request(app)
      .put('/usuario/me')
      .set('Authorization', 'Bearer user-1-token')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve bloquear campo extra inesperado sem executar service', async () => {
    const payload = { nome: 'ok', extra: 'malicioso' };
    const response = await request(app)
      .put('/usuario/me')
      .set('Authorization', 'Bearer user-1-token')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });
});
