import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const progressosMocks = vi.hoisted(() => ({
  watchProgressFindMany: vi.fn(),
  watchProgressDeleteMany: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    watchProgress: {
      findMany: progressosMocks.watchProgressFindMany,
      deleteMany: progressosMocks.watchProgressDeleteMany,
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

describe('Rotas de progressos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar id inválido sem consultar o banco', async () => {
    const response = await request(app)
      .get('/usuarios/abc/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(progressosMocks.watchProgressFindMany).not.toHaveBeenCalled();
  });

  it('deve bloquear leitura de progressos de outro usuário', async () => {
    const response = await request(app)
      .get('/usuarios/2/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(progressosMocks.watchProgressFindMany).not.toHaveBeenCalled();
  });

  it('deve listar os progressos do próprio usuário', async () => {
    progressosMocks.watchProgressFindMany.mockResolvedValueOnce([
      {
        usuarioId: 1,
        episodioId: 10,
        segundosAssistidos: 300,
        porcentagem: 50,
        assistido: false,
        episodio: {
          anime: {
            id: 7,
            titulo: 'One Piece',
          },
        },
      },
    ]);

    const response = await request(app)
      .get('/usuarios/1/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(progressosMocks.watchProgressFindMany).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
      include: {
        episodio: {
          include: {
            anime: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },
      },
    });
  });

  it('deve retornar 500 quando falhar ao buscar progressos', async () => {
    progressosMocks.watchProgressFindMany.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app)
      .get('/usuarios/1/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar progressos' });
  });

  it('deve rejeitar id inválido ao apagar progressos', async () => {
    const response = await request(app)
      .delete('/usuarios/abc/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(progressosMocks.watchProgressDeleteMany).not.toHaveBeenCalled();
  });

  it('deve bloquear exclusão de progressos de outro usuário sem permissão', async () => {
    const response = await request(app)
      .delete('/usuarios/2/progressos')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(progressosMocks.watchProgressDeleteMany).not.toHaveBeenCalled();
  });

  it('deve permitir que admin apague progressos de outro usuário', async () => {
    progressosMocks.watchProgressDeleteMany.mockResolvedValueOnce({ count: 4 });

    const response = await request(app)
      .delete('/usuarios/1/progressos')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(204);
    expect(progressosMocks.watchProgressDeleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
    });
  });

  it('deve retornar 500 quando falhar ao apagar progressos', async () => {
    progressosMocks.watchProgressDeleteMany.mockRejectedValueOnce(new Error('falha ao apagar'));

    const response = await request(app)
      .delete('/usuarios/1/progressos')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao deletar progressos' });
  });
});
