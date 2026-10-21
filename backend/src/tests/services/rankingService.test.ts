import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  animeFindMany: vi.fn(),
  personagemFindMany: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    anime: {
      findMany: prismaMocks.animeFindMany,
    },
    personagem: {
      findMany: prismaMocks.personagemFindMany,
    },
  },
}));

import { rankingService } from '../../services/rankingService';

describe('rankingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar top animes ordenados por favoritos', async () => {
    prismaMocks.animeFindMany.mockResolvedValueOnce([
      {
        id: 1,
        titulo: 'Naruto',
        capaUrl: '/capas/naruto.jpg',
        tipo: 'TV',
        ano: 2002,
        _count: { favoritosUsuarios: 12 },
      },
    ]);

    const resultado = await rankingService.getTopAnimes();

    expect(prismaMocks.animeFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        titulo: true,
        capaUrl: true,
        tipo: true,
        ano: true,
        _count: {
          select: {
            favoritosUsuarios: true,
          },
        },
      },
      orderBy: [
        {
          favoritosUsuarios: {
            _count: 'desc',
          },
        },
        { titulo: 'asc' },
      ],
      take: 10,
    });
    expect(resultado).toEqual([
      {
        id: 1,
        titulo: 'Naruto',
        capaUrl: '/capas/naruto.jpg',
        tipo: 'TV',
        ano: 2002,
        totalFavoritos: 12,
      },
    ]);
  });

  it('deve listar top personagens ordenados por favoritos', async () => {
    prismaMocks.personagemFindMany.mockResolvedValueOnce([
      {
        id: 2,
        nome: 'Luffy',
        imagem: '/personagens/luffy.jpg',
        papel: 'Protagonista',
        afiliacao: 'Chapéus de Palha',
        _count: { favoritos: 20 },
      },
    ]);

    const resultado = await rankingService.getTopPersonagens();

    expect(prismaMocks.personagemFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        nome: true,
        imagem: true,
        papel: true,
        afiliacao: true,
        _count: {
          select: {
            favoritos: true,
          },
        },
      },
      orderBy: [
        {
          favoritos: {
            _count: 'desc',
          },
        },
        { nome: 'asc' },
      ],
      take: 10,
    });
    expect(resultado).toEqual([
      {
        id: 2,
        nome: 'Luffy',
        imagem: '/personagens/luffy.jpg',
        papel: 'Protagonista',
        afiliacao: 'Chapéus de Palha',
        totalFavoritos: 20,
      },
    ]);
  });
});
