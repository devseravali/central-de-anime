import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const favoritosMocks = vi.hoisted(() => ({
  usuarioFavoritoAnimeFindMany: vi.fn(),
  personagemFavoritoFindMany: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuarioFavoritoAnime: {
      findMany: favoritosMocks.usuarioFavoritoAnimeFindMany,
    },
    personagemFavorito: {
      findMany: favoritosMocks.personagemFavoritoFindMany,
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

describe('Rotas de favoritos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar id inválido ao listar favoritos de animes', async () => {
    const response = await request(app)
      .get('/usuarios/abc/favoritos/animes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(favoritosMocks.usuarioFavoritoAnimeFindMany).not.toHaveBeenCalled();
  });

  it('deve bloquear acesso a favoritos de outro usuário', async () => {
    const response = await request(app)
      .get('/usuarios/2/favoritos/animes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(favoritosMocks.usuarioFavoritoAnimeFindMany).not.toHaveBeenCalled();
  });

  it('deve listar favoritos de animes do próprio usuário', async () => {
    favoritosMocks.usuarioFavoritoAnimeFindMany.mockResolvedValueOnce([
      {
        anime: {
          id: 7,
          titulo: 'One Piece',
          tipo: 'TV',
          temporada: 'Verão',
          ano: 1999,
          sinopse: 'Piratas',
          capaUrl: 'https://teste.com/one-piece.jpg',
          quantidadeEpisodios: 1000,
          estudio: { id: 1, nome: 'Toei' },
          status: { id: 1, nome: 'Em andamento' },
        },
      },
    ]);

    const response = await request(app)
      .get('/usuarios/1/favoritos/animes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({ id: 7, titulo: 'One Piece' }),
    ]);
    expect(favoritosMocks.usuarioFavoritoAnimeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuarioId: 1 } })
    );
  });

  it('deve retornar 500 ao falhar a busca de favoritos de animes', async () => {
    favoritosMocks.usuarioFavoritoAnimeFindMany.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app)
      .get('/usuarios/1/favoritos/animes')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar favoritos' });
  });

  it('deve rejeitar id inválido ao listar favoritos de personagens', async () => {
    const response = await request(app)
      .get('/usuarios/abc/favoritos/personagens')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(favoritosMocks.personagemFavoritoFindMany).not.toHaveBeenCalled();
  });

  it('deve permitir que admin liste favoritos de personagens de outro usuário', async () => {
    favoritosMocks.personagemFavoritoFindMany.mockResolvedValueOnce([
      {
        personagem: {
          id: 3,
          nome: 'Zoro',
        },
      },
    ]);

    const response = await request(app)
      .get('/usuarios/1/favoritos/personagens')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 3, nome: 'Zoro' }]);
    expect(favoritosMocks.personagemFavoritoFindMany).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
      include: { personagem: true },
    });
  });

  it('deve retornar 500 ao falhar a busca de favoritos de personagens', async () => {
    favoritosMocks.personagemFavoritoFindMany.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app)
      .get('/usuarios/1/favoritos/personagens')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar favoritos' });
  });
});
