import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  usuarioFavoritoAnimeUpsert: vi.fn(),
  usuarioFavoritoAnimeDeleteMany: vi.fn(),
  personagemFavoritoUpsert: vi.fn(),
  personagemFavoritoDeleteMany: vi.fn(),
  notaAnimeUsuarioUpsert: vi.fn(),
  notaAnimeUsuarioDeleteMany: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuarioFavoritoAnime: {
      upsert: prismaMocks.usuarioFavoritoAnimeUpsert,
      deleteMany: prismaMocks.usuarioFavoritoAnimeDeleteMany,
    },
    personagemFavorito: {
      upsert: prismaMocks.personagemFavoritoUpsert,
      deleteMany: prismaMocks.personagemFavoritoDeleteMany,
    },
    notaAnimeUsuario: {
      upsert: prismaMocks.notaAnimeUsuarioUpsert,
      deleteMany: prismaMocks.notaAnimeUsuarioDeleteMany,
    },
  },
}));

import { interacaoService } from '../../services/interacaoService';

describe('interacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve favoritar anime com upsert idempotente', async () => {
    await interacaoService.favoritarAnime(1, 2);

    expect(prismaMocks.usuarioFavoritoAnimeUpsert).toHaveBeenCalledWith({
      where: { usuarioId_animeId: { usuarioId: 1, animeId: 2 } },
      update: {},
      create: { usuarioId: 1, animeId: 2 },
    });
  });

  it('deve desfavoritar anime filtrando usuário e anime', async () => {
    await interacaoService.desfavoritarAnime(1, 2);

    expect(prismaMocks.usuarioFavoritoAnimeDeleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, animeId: 2 },
    });
  });

  it('deve favoritar personagem com upsert idempotente', async () => {
    await interacaoService.favoritarPersonagem(3, 4);

    expect(prismaMocks.personagemFavoritoUpsert).toHaveBeenCalledWith({
      where: { usuarioId_personagemId: { usuarioId: 3, personagemId: 4 } },
      update: {},
      create: { usuarioId: 3, personagemId: 4 },
    });
  });

  it('deve rejeitar nota fora do intervalo permitido', async () => {
    await expect(interacaoService.darNota(1, 2, 11)).rejects.toThrow('A nota deve estar entre 0 e 10');
    await expect(interacaoService.darNota(1, 2, -1)).rejects.toThrow('A nota deve estar entre 0 e 10');
    expect(prismaMocks.notaAnimeUsuarioUpsert).not.toHaveBeenCalled();
  });

  it('deve desfavoritar personagem filtrando usuário e personagem', async () => {
    await interacaoService.desfavoritarPersonagem(3, 4);

    expect(prismaMocks.personagemFavoritoDeleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 3, personagemId: 4 },
    });
  });

  it('deve remover nota filtrando usuário e anime', async () => {
    await interacaoService.removerNota(1, 2);

    expect(prismaMocks.notaAnimeUsuarioDeleteMany).toHaveBeenCalledWith({
      where: { usuarioId: 1, animeId: 2 },
    });
  });

  it('deve salvar nota válida por upsert', async () => {
    await interacaoService.darNota(1, 2, 8);

    expect(prismaMocks.notaAnimeUsuarioUpsert).toHaveBeenCalledWith({
      where: { usuarioId_animeId: { usuarioId: 1, animeId: 2 } },
      update: { nota: 8 },
      create: { usuarioId: 1, animeId: 2, nota: 8 },
    });
  });
});