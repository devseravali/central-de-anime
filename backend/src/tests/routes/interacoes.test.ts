import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const interacaoControllerMocks = vi.hoisted(() => ({
  favoritarAnime: vi.fn((_req, res) => res.status(204).send()),
  desfavoritarAnime: vi.fn((_req, res) => res.status(204).send()),
  darNota: vi.fn((_req, res) => res.status(204).send()),
  removerNota: vi.fn((_req, res) => res.status(204).send()),
  favoritarPersonagem: vi.fn((_req, res) => res.status(204).send()),
  desfavoritarPersonagem: vi.fn((_req, res) => res.status(204).send()),
}));

vi.mock('../../controllers/interacaoController', () => ({
  interacaoController: interacaoControllerMocks,
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

    if (header === 'Bearer user-token') {
      req.user = { id: 1, role: 'USER', email: 'user@teste.com', nome: 'User' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('Rotas de Interações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /animes/:animeId/favoritar', () => {
    it('deve rejeitar sem token com 401', async () => {
      const res = await request(app).post('/animes/10/favoritar');

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.favoritarAnime).not.toHaveBeenCalled();
    });

    it('deve delegar para interacaoController.favoritarAnime quando autenticado', async () => {
      const res = await request(app)
        .post('/animes/10/favoritar')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.favoritarAnime).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /animes/:animeId/desfavoritar', () => {
    it('deve rejeitar sem token com 401', async () => {
      const res = await request(app).post('/animes/10/desfavoritar');

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.desfavoritarAnime).not.toHaveBeenCalled();
    });

    it('deve delegar para interacaoController.desfavoritarAnime quando autenticado', async () => {
      const res = await request(app)
        .post('/animes/10/desfavoritar')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.desfavoritarAnime).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST e DELETE /animes/:animeId/nota', () => {
    it('deve rejeitar POST sem token com 401', async () => {
      const res = await request(app).post('/animes/10/nota').send({ nota: 8 });

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.darNota).not.toHaveBeenCalled();
    });

    it('deve delegar para darNota quando autenticado', async () => {
      const res = await request(app)
        .post('/animes/10/nota')
        .set('Authorization', 'Bearer user-token')
        .send({ nota: 8 });

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.darNota).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar DELETE sem token com 401', async () => {
      const res = await request(app).delete('/animes/10/nota');

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.removerNota).not.toHaveBeenCalled();
    });

    it('deve delegar para removerNota quando autenticado', async () => {
      const res = await request(app)
        .delete('/animes/10/nota')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.removerNota).toHaveBeenCalledTimes(1);
    });
  });

  describe('Personagens: favoritar e desfavoritar', () => {
    it('deve rejeitar POST /personagens/:id/favoritar sem token com 401', async () => {
      const res = await request(app).post('/personagens/5/favoritar');

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.favoritarPersonagem).not.toHaveBeenCalled();
    });

    it('deve delegar para favoritarPersonagem quando autenticado', async () => {
      const res = await request(app)
        .post('/personagens/5/favoritar')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.favoritarPersonagem).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar POST /personagens/:id/desfavoritar sem token com 401', async () => {
      const res = await request(app).post('/personagens/5/desfavoritar');

      expect(res.status).toBe(401);
      expect(interacaoControllerMocks.desfavoritarPersonagem).not.toHaveBeenCalled();
    });

    it('deve delegar para desfavoritarPersonagem quando autenticado', async () => {
      const res = await request(app)
        .post('/personagens/5/desfavoritar')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(204);
      expect(interacaoControllerMocks.desfavoritarPersonagem).toHaveBeenCalledTimes(1);
    });
  });
});
