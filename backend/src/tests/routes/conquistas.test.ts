import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const conquistasMocks = vi.hoisted(() => ({
  watchProgressCount: vi.fn(),
  usuarioFavoritoAnimeCount: vi.fn(),
  personagemFavoritoCount: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    watchProgress: {
      count: conquistasMocks.watchProgressCount,
    },
    usuarioFavoritoAnime: {
      count: conquistasMocks.usuarioFavoritoAnimeCount,
    },
    personagemFavorito: {
      count: conquistasMocks.personagemFavoritoCount,
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

describe('Rotas de conquistas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar id inválido', async () => {
    const response = await request(app)
      .get('/usuarios/abc/conquistas')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID inválido' });
    expect(conquistasMocks.watchProgressCount).not.toHaveBeenCalled();
  });

  it('deve bloquear acesso de usuário comum a conquistas de outro usuário', async () => {
    const response = await request(app)
      .get('/usuarios/2/conquistas')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(conquistasMocks.watchProgressCount).not.toHaveBeenCalled();
  });

  it('deve listar conquistas do próprio usuário', async () => {
    conquistasMocks.watchProgressCount.mockResolvedValueOnce(12);
    conquistasMocks.usuarioFavoritoAnimeCount.mockResolvedValueOnce(4);
    conquistasMocks.personagemFavoritoCount.mockResolvedValueOnce(3);

    const response = await request(app)
      .get('/usuarios/1/conquistas')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body.usuarioId).toBe(1);
    expect(response.body.resumo).toEqual(
      expect.objectContaining({ total: expect.any(Number), desbloqueadas: expect.any(Number) })
    );
    expect(Array.isArray(response.body.conquistas)).toBe(true);
    expect(response.body.conquistas.length).toBeGreaterThan(0);
  });

  it('deve permitir que admin consulte conquistas de outro usuário', async () => {
    conquistasMocks.watchProgressCount.mockResolvedValueOnce(1);
    conquistasMocks.usuarioFavoritoAnimeCount.mockResolvedValueOnce(0);
    conquistasMocks.personagemFavoritoCount.mockResolvedValueOnce(0);

    const response = await request(app)
      .get('/usuarios/1/conquistas')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body.usuarioId).toBe(1);
  });

  it('deve retornar 500 quando ocorrer erro interno', async () => {
    conquistasMocks.watchProgressCount.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app)
      .get('/usuarios/1/conquistas')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar conquistas' });
  });
});
