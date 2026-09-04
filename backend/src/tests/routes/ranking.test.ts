import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const rankingControllerMocks = vi.hoisted(() => ({
  getByUsuarioId: vi.fn((_req, res) => res.status(200).json({ usuarioId: 1, pontos: 100 })),
  getPontos: vi.fn((_req, res) => res.status(200).json({ usuarioId: 1, pontos: 100 })),
  atualizar: vi.fn((_req, res) => res.status(200).json({ usuarioId: 1, atualizado: true })),
  recalcular: vi.fn((_req, res) => res.status(200).json({ usuarioId: 1, recalculado: true })),
  getTop: vi.fn((_req, res) => res.status(200).json([{ usuarioId: 1, pontos: 100 }])),
}));

vi.mock('../../controllers/rankingController', () => ({
  rankingController: rankingControllerMocks,
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

describe('Rotas de Ranking (/ranking)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /ranking/:usuarioId', () => {
    it('deve rejeitar sem autenticação retornando 401', async () => {
      const res = await request(app).get('/ranking/1');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Token de autenticação não fornecido' });
      expect(rankingControllerMocks.getByUsuarioId).not.toHaveBeenCalled();
    });

    it('deve permitir acesso autenticado e delegar ao rankingController.getByUsuarioId', async () => {
      const res = await request(app)
        .get('/ranking/1')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.getByUsuarioId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /ranking/:usuarioId/pontos', () => {
    it('deve rejeitar sem autenticação retornando 401', async () => {
      const res = await request(app).get('/ranking/1/pontos');

      expect(res.status).toBe(401);
      expect(rankingControllerMocks.getPontos).not.toHaveBeenCalled();
    });

    it('deve permitir acesso autenticado e delegar ao rankingController.getPontos', async () => {
      const res = await request(app)
        .get('/ranking/1/pontos')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.getPontos).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /ranking/:usuarioId/atualizar', () => {
    it('deve rejeitar sem autenticação retornando 401', async () => {
      const res = await request(app).post('/ranking/1/atualizar').send({});

      expect(res.status).toBe(401);
      expect(rankingControllerMocks.atualizar).not.toHaveBeenCalled();
    });

    it('deve permitir acesso autenticado e delegar ao rankingController.atualizar', async () => {
      const res = await request(app)
        .post('/ranking/1/atualizar')
        .set('Authorization', 'Bearer user-token')
        .send({});

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.atualizar).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /ranking/:usuarioId/recalcular', () => {
    it('deve rejeitar sem autenticação retornando 401', async () => {
      const res = await request(app).post('/ranking/1/recalcular').send({});

      expect(res.status).toBe(401);
      expect(rankingControllerMocks.recalcular).not.toHaveBeenCalled();
    });

    it('deve permitir acesso autenticado e delegar ao rankingController.recalcular', async () => {
      const res = await request(app)
        .post('/ranking/1/recalcular')
        .set('Authorization', 'Bearer user-token')
        .send({});

      expect(res.status).toBe(200);
      expect(rankingControllerMocks.recalcular).toHaveBeenCalledTimes(1);
    });
  });
});
