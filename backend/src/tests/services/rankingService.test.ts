import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  rankingFindUnique: vi.fn(),
  rankingUpsert: vi.fn(),
  watchProgressCount: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    rankingUsuario: {
      findUnique: prismaMocks.rankingFindUnique,
      upsert: prismaMocks.rankingUpsert,
    },
    watchProgress: {
      count: prismaMocks.watchProgressCount,
    },
  },
}));

import { rankingService } from '../../services/rankingService';

describe('rankingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar ranking por usuarioId', async () => {
    prismaMocks.rankingFindUnique.mockResolvedValueOnce({ usuarioId: 1, pontos: 30 });

    const resultado = await rankingService.getRankingByUsuarioId(1);

    expect(resultado).toEqual({ usuarioId: 1, pontos: 30 });
    expect(prismaMocks.rankingFindUnique).toHaveBeenCalledWith({ where: { usuarioId: 1 } });
  });

  it('deve calcular pontos com base em episódios assistidos', async () => {
    prismaMocks.watchProgressCount.mockResolvedValueOnce(7);

    const pontos = await rankingService.calcularPontos(2);

    expect(pontos).toBe(70);
    expect(prismaMocks.watchProgressCount).toHaveBeenCalledWith({
      where: { usuarioId: 2, assistido: true },
    });
  });

  it('deve atualizar ranking com pontos, nível e total assistido', async () => {
    prismaMocks.watchProgressCount.mockResolvedValueOnce(12);
    prismaMocks.rankingUpsert.mockResolvedValueOnce({ usuarioId: 3, pontos: 120, nivel: 2, totalEpisodiosAssistidos: 12 });

    await rankingService.atualizarRanking(3);

    expect(prismaMocks.rankingUpsert).toHaveBeenCalledWith({
      where: { usuarioId: 3 },
      update: { pontos: 120, nivel: 2, totalEpisodiosAssistidos: 12 },
      create: { usuarioId: 3, pontos: 120, nivel: 2, totalEpisodiosAssistidos: 12 },
    });
  });

  it('deve recalcular ranking reaproveitando a atualização', async () => {
    prismaMocks.watchProgressCount.mockResolvedValueOnce(1);
    prismaMocks.rankingUpsert.mockResolvedValueOnce({ usuarioId: 4, pontos: 10, nivel: 1, totalEpisodiosAssistidos: 1 });

    const resultado = await rankingService.recalcularRanking(4);

    expect(resultado).toEqual({ usuarioId: 4, pontos: 10, nivel: 1, totalEpisodiosAssistidos: 1 });
  });
});