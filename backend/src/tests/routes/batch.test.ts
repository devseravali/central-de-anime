import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const prismaMocks = vi.hoisted(() => ({
  animeFindMany: vi.fn(),
}));

const animeServiceMocks = vi.hoisted(() => ({
  batchUpsertAnimes: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    anime: {
      findMany: prismaMocks.animeFindMany,
    },
  },
}));

vi.mock('../../services/animeService', () => ({
  animeService: animeServiceMocks,
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
  adminMiddleware: (
    req: { user?: UsuarioAutenticado },
    res: { status: (code: number) => { json: (body: unknown) => unknown } },
    next: () => void
  ) => {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado: requer privilégios de administrador' });
      return;
    }
    next();
  },
}));

import app from '../../app';

describe('Rotas de Batch (/animes/batch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar requisição sem autenticação com status 401', async () => {
    const res = await request(app)
      .post('/animes/batch')
      .send({ ids: [1, 2] });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token de autenticação não fornecido' });
  });

  it('deve bloquear usuário sem privilégios de administrador com status 403', async () => {
    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer user-token')
      .send({ ids: [1, 2] });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: 'Acesso negado: requer privilégios de administrador',
    });
  });

  it('deve rejeitar payload inválido pelo schema Zod com status 400', async () => {
    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer admin-token')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('deve buscar animes em lote quando fornecido objeto com lista de ids', async () => {
    prismaMocks.animeFindMany.mockResolvedValueOnce([
      { id: 1, titulo: 'Anime 1' },
      { id: 2, titulo: 'Anime 2' },
    ]);

    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer admin-token')
      .send({ ids: [1, 2] });

    expect(res.status).toBe(200);
    expect(prismaMocks.animeFindMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
      select: { id: true, titulo: true },
    });
    expect(res.body).toEqual({
      animesFound: 2,
      animes: [
        { id: 1, titulo: 'Anime 1' },
        { id: 2, titulo: 'Anime 2' },
      ],
    });
  });

  it('deve processar inserção/atualização em lote quando fornecido array de animes', async () => {
    animeServiceMocks.batchUpsertAnimes.mockResolvedValueOnce([
      { id: 10, titulo: 'Anime Importado 1' },
      { id: 11, titulo: 'Anime Importado 2' },
    ]);

    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer admin-token')
      .send([
        { titulo: 'Anime Importado 1' },
        { titulo: 'Anime Importado 2' },
      ]);

    expect(res.status).toBe(200);
    expect(animeServiceMocks.batchUpsertAnimes).toHaveBeenCalledWith([
      { titulo: 'Anime Importado 1' },
      { titulo: 'Anime Importado 2' },
    ]);
    expect(res.body).toEqual([
      { id: 10, titulo: 'Anime Importado 1' },
      { id: 11, titulo: 'Anime Importado 2' },
    ]);
  });

  it('deve processar inserção quando fornecido um único anime como objeto', async () => {
    animeServiceMocks.batchUpsertAnimes.mockResolvedValueOnce([
      { id: 20, titulo: 'Anime Único' },
    ]);

    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer admin-token')
      .send({ titulo: 'Anime Único' });

    expect(res.status).toBe(200);
    expect(animeServiceMocks.batchUpsertAnimes).toHaveBeenCalledWith([
      { titulo: 'Anime Único' },
    ]);
    expect(res.body).toEqual([{ id: 20, titulo: 'Anime Único' }]);
  });

  it('deve retornar status 500 caso o serviço lance exceção no batch', async () => {
    animeServiceMocks.batchUpsertAnimes.mockRejectedValueOnce(
      new Error('Erro interno no banco')
    );

    const res = await request(app)
      .post('/animes/batch')
      .set('Authorization', 'Bearer admin-token')
      .send([{ titulo: 'Anime Falho' }]);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Erro no batch' });
  });
});
