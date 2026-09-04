import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rankingServiceMocks = vi.hoisted(() => ({
  getRankingByUsuarioId: vi.fn(),
  calcularPontos: vi.fn(),
  atualizarRanking: vi.fn(),
  recalcularRanking: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({ rankingFindMany: vi.fn() }));

vi.mock('../../services/rankingService', () => ({ rankingService: rankingServiceMocks }));
vi.mock('../../config/prisma', () => ({ prisma: { rankingUsuario: { findMany: prismaMocks.rankingFindMany } } }));

import { rankingController } from '../../controllers/rankingController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('rankingController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve exigir usuarioId para buscar ranking', async () => {
    const req = { params: {}, user: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await rankingController.getByUsuarioId(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId é obrigatório' });
  });

  it('deve retornar 404 quando ranking não existir', async () => {
    const req = { params: { usuarioId: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockResolvedValueOnce(null);

    await rankingController.getByUsuarioId(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Ranking não encontrado para este usuário' });
  });

  it('deve retornar pontos calculados', async () => {
    const req = { params: { usuarioId: '5' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.calcularPontos.mockResolvedValueOnce(120);

    await rankingController.getPontos(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ usuarioId: 5, pontos: 120 });
  });

  it('deve retornar top ranking público', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    prismaMocks.rankingFindMany.mockResolvedValueOnce([{ usuarioId: 1, pontos: 100 }]);

    await rankingController.getTop(req, res);

    expect(prismaMocks.rankingFindMany).toHaveBeenCalledWith({
      orderBy: { pontos: 'desc' },
      take: 20,
      include: { usuario: { select: { id: true, nome: true, avatar: true } } },
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  it('deve obter usuarioId a partir de req.user quando não vier em params', async () => {
    const req = { params: {}, user: { id: 3 } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockResolvedValueOnce({ usuarioId: 3, pontos: 50 });

    await rankingController.getByUsuarioId(req, res);

    expect(rankingServiceMocks.getRankingByUsuarioId).toHaveBeenCalledWith(3);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ usuarioId: 3, pontos: 50 });
  });

  it('deve retornar 500 caso getByUsuarioId lance exceção', async () => {
    const req = { params: { usuarioId: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.getRankingByUsuarioId.mockRejectedValueOnce(new Error('Erro de banco'));

    await rankingController.getByUsuarioId(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar ranking' });
  });

  it('deve retornar 500 caso getPontos lance exceção', async () => {
    const req = { params: { usuarioId: '1' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.calcularPontos.mockRejectedValueOnce(new Error('Erro no cálculo'));

    await rankingController.getPontos(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao calcular pontos' });
  });

  it('deve rejeitar atualizar quando usuarioId não for informado', async () => {
    const req = { params: {}, user: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await rankingController.atualizar(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId é obrigatório' });
  });

  it('deve atualizar ranking com sucesso', async () => {
    const req = { params: { usuarioId: '4' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.atualizarRanking.mockResolvedValueOnce({ usuarioId: 4, pontos: 150 });

    await rankingController.atualizar(req, res);

    expect(rankingServiceMocks.atualizarRanking).toHaveBeenCalledWith(4);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ usuarioId: 4, pontos: 150 });
  });

  it('deve retornar 500 caso atualizar ranking lance exceção', async () => {
    const req = { params: { usuarioId: '4' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.atualizarRanking.mockRejectedValueOnce(new Error('Erro de transação'));

    await rankingController.atualizar(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao atualizar ranking' });
  });

  it('deve rejeitar recalcular quando usuarioId não for informado', async () => {
    const req = { params: {}, user: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await rankingController.recalcular(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'usuarioId é obrigatório' });
  });

  it('deve recalcular ranking com sucesso', async () => {
    const req = { params: { usuarioId: '7' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.recalcularRanking.mockResolvedValueOnce({ usuarioId: 7, pontos: 200 });

    await rankingController.recalcular(req, res);

    expect(rankingServiceMocks.recalcularRanking).toHaveBeenCalledWith(7);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ usuarioId: 7, pontos: 200 });
  });

  it('deve retornar 500 caso recalcular lance exceção', async () => {
    const req = { params: { usuarioId: '7' } } as unknown as Request;
    const { res, status, json } = criarResponse();
    rankingServiceMocks.recalcularRanking.mockRejectedValueOnce(new Error('Erro interno'));

    await rankingController.recalcular(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao recalcular ranking' });
  });

  it('deve retornar 500 caso getTop lance exceção', async () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    prismaMocks.rankingFindMany.mockRejectedValueOnce(new Error('Falha no banco'));

    await rankingController.getTop(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao buscar top ranking' });
  });
});