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
  promoteToAdmin: vi.fn(),
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

    if (header === 'Bearer user-token') {
      req.user = { id: 1, role: 'USER', email: 'user@teste.com', nome: 'User' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

vi.mock('../../middlewares/adminMiddleware', () => ({
  adminMiddleware: (req: { user?: UsuarioAutenticado }, res: { status: (code: number) => { json: (body: unknown) => unknown } }, next: () => void) => {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado: privilégios de administrador necessários' });
      return;
    }

    next();
  },
}));

import app from '../../app';

describe('Rotas administrativas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exigir autenticação para listar usuários administrativos', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token de autenticação não fornecido' });
  });

  it('deve bloquear usuário comum em rota administrativa', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Acesso negado: privilégios de administrador necessários',
    });
  });

  it('deve expor que a listagem administrativa ainda não está implementada', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(501);
    expect(response.body.message).toContain('Not implemented');
  });

  it('deve permitir banimento via rota administrativa com id válido', async () => {
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({ id: 2, status: 'banido' });

    const response = await request(app)
      .post('/users/2/ban')
      .set('Authorization', 'Bearer admin-token')
      .send({});

    expect(response.status).toBe(200);
    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(2, { status: 'banido' });
  });

  it('deve rejeitar id inválido antes de chamar o service', async () => {
    const response = await request(app)
      .post('/users/abc/promote')
      .set('Authorization', 'Bearer admin-token')
      .send({ nivel: 'owner' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(usuarioServiceMocks.promoteToAdmin).not.toHaveBeenCalled();
  });
});
