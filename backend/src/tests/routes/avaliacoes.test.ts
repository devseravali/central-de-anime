import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const prismaMocks = vi.hoisted(() => ({
  notaAnimeUsuarioFindMany: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    notaAnimeUsuario: {
      findMany: prismaMocks.notaAnimeUsuarioFindMany,
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

describe('Rotas de avaliações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar id inválido ao listar avaliações de anime', async () => {
    const response = await request(app).get('/animes/abc/avaliacoes');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(prismaMocks.notaAnimeUsuarioFindMany).not.toHaveBeenCalled();
  });

  it('deve listar avaliações públicas de anime mapeando usuário e nota', async () => {
    prismaMocks.notaAnimeUsuarioFindMany.mockResolvedValueOnce([
      {
        usuario: { id: 3, nome: 'Naruto', avatar: 'naruto.png' },
        nota: 9,
      },
    ]);

    const response = await request(app).get('/animes/7/avaliacoes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { usuario: { id: 3, nome: 'Naruto', avatar: 'naruto.png' }, nota: 9 },
    ]);
    expect(prismaMocks.notaAnimeUsuarioFindMany).toHaveBeenCalledWith({
      where: { animeId: 7 },
      include: { usuario: { select: { id: true, nome: true, avatar: true } } },
    });
  });

  it('deve mascarar erro interno ao listar avaliações públicas do anime retornando status 500', async () => {
    prismaMocks.notaAnimeUsuarioFindMany.mockRejectedValueOnce(new Error('Falha no banco'));

    const response = await request(app).get('/animes/7/avaliacoes');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar avaliações' });
  });

  it('deve exigir autenticação para listar avaliações do usuário', async () => {
    const response = await request(app).get('/usuarios/1/avaliacoes');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token de autenticação não fornecido' });
  });

  it('deve bloquear acesso às avaliações de outro usuário', async () => {
    const response = await request(app)
      .get('/usuarios/2/avaliacoes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(prismaMocks.notaAnimeUsuarioFindMany).not.toHaveBeenCalled();
  });

  it('deve permitir que o próprio usuário liste suas avaliações', async () => {
    prismaMocks.notaAnimeUsuarioFindMany.mockResolvedValueOnce([
      {
        anime: { id: 8, titulo: 'Bleach', capaUrl: 'bleach.jpg' },
        nota: 10,
      },
    ]);

    const response = await request(app)
      .get('/usuarios/1/avaliacoes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { anime: { id: 8, titulo: 'Bleach', capaUrl: 'bleach.jpg' }, nota: 10 },
    ]);
  });

  it('deve permitir que admin liste avaliações de qualquer usuário', async () => {
    prismaMocks.notaAnimeUsuarioFindMany.mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/usuarios/2/avaliacoes')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(prismaMocks.notaAnimeUsuarioFindMany).toHaveBeenCalledWith({
      where: { usuarioId: 2 },
      include: { anime: { select: { id: true, titulo: true, capaUrl: true } } },
    });
  });

  it('deve mascarar erro interno ao listar avaliações do usuário', async () => {
    prismaMocks.notaAnimeUsuarioFindMany.mockRejectedValueOnce(new Error('db fail'));

    const response = await request(app)
      .get('/usuarios/1/avaliacoes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar avaliações' });
  });
});
