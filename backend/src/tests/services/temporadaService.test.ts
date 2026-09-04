import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  temporadaFindMany: vi.fn(),
  temporadaFindUnique: vi.fn(),
  temporadaFindFirst: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    temporada: {
      findMany: prismaMocks.temporadaFindMany,
      findUnique: prismaMocks.temporadaFindUnique,
      findFirst: prismaMocks.temporadaFindFirst,
    },
  },
}));

import { temporadaService } from '../../services/temporadaService';

describe('temporadaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar temporadas ordenadas por id', async () => {
    await temporadaService.listTemporadas();

    expect(prismaMocks.temporadaFindMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  it('deve listar temporadas filtrando por anime', async () => {
    await temporadaService.listTemporadasByAnimeId(4);

    expect(prismaMocks.temporadaFindMany).toHaveBeenCalledWith({
      where: { episodios: { some: { animeId: 4 } } },
      orderBy: { id: 'asc' },
    });
  });

  it('deve verificar existência de temporada por anime', async () => {
    prismaMocks.temporadaFindFirst.mockResolvedValueOnce({ id: 3 });

    const existe = await temporadaService.existsTemporadaForAnime(3, 4);

    expect(existe).toBe(true);
    expect(prismaMocks.temporadaFindFirst).toHaveBeenCalledWith({
      where: { id: 3, episodios: { some: { animeId: 4 } } },
      select: { id: true },
    });
  });

  it('deve buscar temporada por id', async () => {
    prismaMocks.temporadaFindUnique.mockResolvedValueOnce({ id: 10, nome: '1ª Temporada' });

    const resultado = await temporadaService.getTemporadaById(10);

    expect(prismaMocks.temporadaFindUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(resultado).toEqual({ id: 10, nome: '1ª Temporada' });
  });

  it('deve retornar false quando temporada não existir para o anime', async () => {
    prismaMocks.temporadaFindFirst.mockResolvedValueOnce(null);

    const existe = await temporadaService.existsTemporadaForAnime(99, 4);

    expect(existe).toBe(false);
  });

  it('deve localizar temporada pelo número e anime', async () => {
    await temporadaService.findTemporadaByAnimeAndSeasonNumber(4, 2);

    expect(prismaMocks.temporadaFindFirst).toHaveBeenCalledWith({
      where: { nome: { contains: '2ª' }, episodios: { some: { animeId: 4 } } },
    });
  });
});