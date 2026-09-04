import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const usuarioServiceMocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
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

describe('Regressão - Autenticação e autorização', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exigir token na rota protegida do perfil', async () => {
    const response = await request(app).get('/usuario/me');

    expect(response.status).toBe(401);
    expect(usuarioServiceMocks.getProfile).not.toHaveBeenCalled();
  });

  it('deve rejeitar token inválido na rota protegida do perfil', async () => {
    const response = await request(app)
      .get('/usuario/me')
      .set('Authorization', 'Bearer INVALID');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token inválido ou expirado' });
  });

  it('deve permitir acesso com token válido', async () => {
    usuarioServiceMocks.getProfile.mockResolvedValueOnce({
      id: 1,
      nome: 'User 1',
      email: 'user1@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .get('/usuario/me')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Perfil carregado');
  });
});
