import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  episodioFindMany: vi.fn(),
  episodioFindUnique: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    episodio: {
      findMany: prismaMocks.episodioFindMany,
      findUnique: prismaMocks.episodioFindUnique,
    },
  },
}));

import { episodioService } from '../../services/episodioService';

describe('episodioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar episódios em ordem crescente por id', async () => {
    await episodioService.listEpisodios();

    expect(prismaMocks.episodioFindMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  it('deve listar episódios por temporada com anime opcional', async () => {
    await episodioService.listEpisodiosByTemporadaId(5, 8);

    expect(prismaMocks.episodioFindMany).toHaveBeenCalledWith({
      where: { temporadaId: 5, animeId: 8 },
      orderBy: { numero: 'asc' },
    });
  });

  it('deve listar episódios por anime', async () => {
    await episodioService.listEpisodiosByAnimeId(9);

    expect(prismaMocks.episodioFindMany).toHaveBeenCalledWith({
      where: { animeId: 9 },
      orderBy: { numero: 'asc' },
    });
  });

  it('deve buscar episódio por id', async () => {
    await episodioService.getEpisodioById(11);

    expect(prismaMocks.episodioFindUnique).toHaveBeenCalledWith({
      where: { id: 11 },
    });
  });
});