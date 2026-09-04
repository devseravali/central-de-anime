import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  personagemFindMany: vi.fn(),
  personagemFindUnique: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    personagem: {
      findMany: prismaMocks.personagemFindMany,
      findUnique: prismaMocks.personagemFindUnique,
    },
  },
}));

import { personagemService } from '../../services/personagemService';

describe('personagemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar todos os personagens ordenados por id em ordem crescente', async () => {
    prismaMocks.personagemFindMany.mockResolvedValueOnce([{ id: 1, nome: 'Monkey D. Luffy' }]);

    const resultado = await personagemService.listPersonagens();

    expect(prismaMocks.personagemFindMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
    expect(resultado).toEqual([{ id: 1, nome: 'Monkey D. Luffy' }]);
  });

  it('deve listar personagens filtrando por animeId', async () => {
    prismaMocks.personagemFindMany.mockResolvedValueOnce([{ id: 2, nome: 'Roronoa Zoro' }]);

    const resultado = await personagemService.listPersonagensByAnimeId(10);

    expect(prismaMocks.personagemFindMany).toHaveBeenCalledWith({
      where: {
        animes: {
          some: {
            animeId: 10,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    expect(resultado).toEqual([{ id: 2, nome: 'Roronoa Zoro' }]);
  });

  it('deve buscar personagem por id', async () => {
    prismaMocks.personagemFindUnique.mockResolvedValueOnce({ id: 3, nome: 'Nami' });

    const resultado = await personagemService.getPersonagemById(3);

    expect(prismaMocks.personagemFindUnique).toHaveBeenCalledWith({
      where: { id: 3 },
    });
    expect(resultado).toEqual({ id: 3, nome: 'Nami' });
  });

  it('deve retornar null se personagem não for encontrado', async () => {
    prismaMocks.personagemFindUnique.mockResolvedValueOnce(null);

    const resultado = await personagemService.getPersonagemById(999);

    expect(resultado).toBeNull();
  });
});
