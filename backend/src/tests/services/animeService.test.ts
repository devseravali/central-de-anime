import { beforeEach, describe, expect, it, vi } from 'vitest';

const nodeCacheMocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  animeFindUnique: vi.fn(),
  animeFindMany: vi.fn(),
  animeCount: vi.fn(),
  animeCreate: vi.fn(),
  animeUpdate: vi.fn(),
  animeDelete: vi.fn(),
  cacheAnimeUpsert: vi.fn(),
  statusFindFirst: vi.fn(),
  generoFindMany: vi.fn(),
  queryRaw: vi.fn(),
  transaction: vi.fn(),
  animeGeneroDeleteMany: vi.fn(),
  animeGeneroCreateMany: vi.fn(),
}));

vi.mock('node-cache', () => ({
  default: class MockNodeCache {
    get = nodeCacheMocks.get;
    set = nodeCacheMocks.set;
    del = nodeCacheMocks.del;
  },
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    anime: {
      findUnique: prismaMocks.animeFindUnique,
      findMany: prismaMocks.animeFindMany,
      count: prismaMocks.animeCount,
      create: prismaMocks.animeCreate,
      update: prismaMocks.animeUpdate,
      delete: prismaMocks.animeDelete,
    },
    cacheAnime: {
      upsert: prismaMocks.cacheAnimeUpsert,
    },
    status: {
      findFirst: prismaMocks.statusFindFirst,
    },
    genero: {
      findMany: prismaMocks.generoFindMany,
    },
    animeGenero: {
      deleteMany: prismaMocks.animeGeneroDeleteMany,
      createMany: prismaMocks.animeGeneroCreateMany,
    },
    $queryRaw: prismaMocks.queryRaw,
    $transaction: prismaMocks.transaction,
  },
}));

import { animeService } from '../../services/animeService';

describe('animeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve paginar e filtrar listagem de animes', async () => {
    prismaMocks.animeFindMany.mockResolvedValueOnce([]);
    prismaMocks.animeCount.mockResolvedValueOnce(0);

    const resultado = await animeService.listAnimes({ page: 2, perPage: 5, titulo: 'One', generoId: 3, statusId: 1 });

    expect(prismaMocks.animeFindMany).toHaveBeenCalledWith({
      where: {
        titulo: { contains: 'One', mode: 'insensitive' },
        generos: { some: { generoId: 3 } },
        statusId: 1,
      },
      skip: 5,
      take: 5,
      orderBy: { id: 'asc' },
    });
    expect(resultado.perPage).toBe(5);
  });

  it('deve retornar perPage correto na busca', async () => {
    prismaMocks.animeFindMany.mockResolvedValueOnce([]);
    prismaMocks.animeCount.mockResolvedValueOnce(0);

    const resultado = await animeService.searchAnimes('naruto', 7, 3);

    expect(resultado.page).toBe(3);
    expect(resultado.perPage).toBe(7);
  });

  it('deve usar cache ao buscar anime com relações', async () => {
    nodeCacheMocks.get.mockReturnValueOnce({ id: 1, titulo: 'Naruto' });

    const resultado = await animeService.getAnimeWithCache(1);

    expect(resultado).toEqual({ id: 1, titulo: 'Naruto' });
    expect(prismaMocks.animeFindUnique).not.toHaveBeenCalled();
  });

  it('deve validar título obrigatório ao criar anime', async () => {
    await expect(animeService.createAnime({})).rejects.toThrow('Campo "titulo" é obrigatório');
  });

  it('deve detectar conflito de anime existente na criação', async () => {
    prismaMocks.queryRaw.mockResolvedValueOnce([{ id: 1, titulo: 'Naruto' }]);

    await expect(animeService.createAnime({ titulo: 'Naruto' })).rejects.toThrow('Anime já existe');
  });

  it('deve criar anime com defaults e limpar cache', async () => {
    prismaMocks.queryRaw.mockResolvedValueOnce([]);
    prismaMocks.animeCreate.mockResolvedValueOnce({ id: 8, titulo: 'Bleach' });

    const resultado = await animeService.createAnime({ titulo: ' Bleach ', quantidadeEpisodios: '24' });

    expect(prismaMocks.animeCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        titulo: 'Bleach',
        tipo: 'serie',
        temporada: 1,
        quantidadeEpisodios: 24,
      }),
    });
    expect(nodeCacheMocks.del).toHaveBeenCalledWith('anime:8');
    expect(resultado).toEqual({ id: 8, titulo: 'Bleach' });
  });

  it('deve rejeitar atualização de anime inexistente', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce(null);

    await expect(animeService.updateAnime(1, { titulo: 'Novo' })).rejects.toThrow('Anime não encontrado');
  });

  it('deve resolver status e gêneros por nome na atualização', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 1, titulo: 'Naruto' });
    prismaMocks.statusFindFirst.mockResolvedValueOnce({ id: 9 });
    prismaMocks.generoFindMany.mockResolvedValueOnce([{ id: 4, nome: 'Ação' }]);
    prismaMocks.transaction.mockImplementationOnce(async (callback: (tx: { animeGenero: { deleteMany: typeof prismaMocks.animeGeneroDeleteMany; createMany: typeof prismaMocks.animeGeneroCreateMany }; anime: { update: typeof prismaMocks.animeUpdate } }) => Promise<unknown>) => callback({
      animeGenero: { deleteMany: prismaMocks.animeGeneroDeleteMany, createMany: prismaMocks.animeGeneroCreateMany },
      anime: { update: prismaMocks.animeUpdate },
    }));
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 1, titulo: 'Naruto Shippuden' });

    await animeService.updateAnime(1, { titulo: 'Naruto Shippuden', status: 'ativo', generos: ['Ação'] });

    expect(prismaMocks.animeGeneroDeleteMany).toHaveBeenCalledWith({ where: { animeId: 1 } });
    expect(prismaMocks.animeGeneroCreateMany).toHaveBeenCalledWith({
      data: [{ animeId: 1, generoId: 4 }],
      skipDuplicates: true,
    });
    expect(prismaMocks.animeUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ titulo: 'Naruto Shippuden', statusId: 9 }),
    }));
  });

  it('deve buscar anime por id sem relações', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 2, titulo: 'One Piece' });

    const resultado = await animeService.getAnimeById(2);

    expect(prismaMocks.animeFindUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(resultado).toEqual({ id: 2, titulo: 'One Piece' });
  });

  it('deve buscar anime por id com relações incluídas', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 2, titulo: 'One Piece', generos: [] });

    const resultado = await animeService.getAnimeById(2, true);

    expect(prismaMocks.animeFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 2 },
      include: expect.objectContaining({ estudio: true, generos: expect.anything() }),
    }));
    expect(resultado).toEqual({ id: 2, titulo: 'One Piece', generos: [] });
  });

  it('deve buscar do banco, salvar no cache e incrementar visualizações quando não estiver em cache', async () => {
    nodeCacheMocks.get.mockReturnValueOnce(undefined);
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 3, titulo: 'Dragon Ball' });
    prismaMocks.cacheAnimeUpsert.mockResolvedValueOnce({ animeId: 3, viewsCount: 1 });

    const resultado = await animeService.getAnimeWithCache(3);

    expect(prismaMocks.cacheAnimeUpsert).toHaveBeenCalledWith({
      where: { animeId: 3 },
      update: { viewsCount: { increment: 1 } },
      create: { anime: { connect: { id: 3 } }, viewsCount: 1 },
    });
    expect(nodeCacheMocks.set).toHaveBeenCalledWith('anime:3', { id: 3, titulo: 'Dragon Ball' });
    expect(resultado).toEqual({ id: 3, titulo: 'Dragon Ball' });
  });

  it('deve retornar null em getAnimeWithCache se anime não for encontrado no banco', async () => {
    nodeCacheMocks.get.mockReturnValueOnce(undefined);
    prismaMocks.animeFindUnique.mockResolvedValueOnce(null);

    const resultado = await animeService.getAnimeWithCache(99);

    expect(resultado).toBeNull();
    expect(prismaMocks.cacheAnimeUpsert).not.toHaveBeenCalled();
    expect(nodeCacheMocks.set).not.toHaveBeenCalled();
  });

  it('deve tolerar falha ao atualizar visualizações no cache sem quebrar a busca', async () => {
    nodeCacheMocks.get.mockReturnValueOnce(undefined);
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 4, titulo: 'Bleach' });
    prismaMocks.cacheAnimeUpsert.mockRejectedValueOnce(new Error('Erro no cache banco'));

    const resultado = await animeService.getAnimeWithCache(4);

    expect(nodeCacheMocks.set).toHaveBeenCalledWith('anime:4', { id: 4, titulo: 'Bleach' });
    expect(resultado).toEqual({ id: 4, titulo: 'Bleach' });
  });

  it('deve rejeitar título composto apenas por espaços em branco', async () => {
    await expect(animeService.createAnime({ titulo: '    ' })).rejects.toThrow('Campo "titulo" é obrigatório');
  });

  it('deve tratar erro P2002 na criação de anime buscando registro conflitante', async () => {
    prismaMocks.queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 10, titulo: 'Hunter x Hunter' }]);
    const erroP2002 = Object.assign(new Error('Erro de duplicidade'), { code: 'P2002' });
    prismaMocks.animeCreate.mockRejectedValueOnce(erroP2002);

    await expect(animeService.createAnime({ titulo: 'Hunter x Hunter' })).rejects.toThrow('Anime já existe');
  });

  it('deve repassar erro genérico na criação de anime', async () => {
    prismaMocks.queryRaw.mockResolvedValueOnce([]);
    prismaMocks.animeCreate.mockRejectedValueOnce(new Error('Falha de conexão com o banco'));

    await expect(animeService.createAnime({ titulo: 'Novo Anime' })).rejects.toThrow('Falha de conexão com o banco');
  });

  it('deve atualizar anime sem gêneros diretamente sem transação', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 5, titulo: 'Nome Antigo' });
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 5, titulo: 'Nome Novo', sinopse: 'Nova sinopse' });

    const resultado = await animeService.updateAnime(5, {
      titulo: 'Nome Novo',
      sinopse: 'Nova sinopse',
      anoLancamento: 2024,
      ano: 2024,
      capaUrl: 'http://capa.png',
      tipo: 'filme',
      temporada: 1,
      quantidadeEpisodios: 1,
      estudioId: 2,
      franquiaId: 3,
      statusId: 4,
    });

    expect(prismaMocks.animeUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: expect.objectContaining({
        titulo: 'Nome Novo',
        sinopse: 'Nova sinopse',
        statusId: 4,
      }),
    });
    expect(nodeCacheMocks.del).toHaveBeenCalledWith('anime:5');
    expect(resultado).toEqual({ id: 5, titulo: 'Nome Novo', sinopse: 'Nova sinopse' });
  });

  it('deve atualizar status informado por id numérico', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 6, titulo: 'Anime' });
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 6, titulo: 'Anime', statusId: 8 });

    await animeService.updateAnime(6, { status: 8 });

    expect(prismaMocks.animeUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 6 },
      data: expect.objectContaining({ statusId: 8 }),
    }));
  });

  it('deve lançar erro quando nome do status não for encontrado na atualização', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 7, titulo: 'Anime' });
    prismaMocks.statusFindFirst.mockResolvedValueOnce(null);

    await expect(animeService.updateAnime(7, { status: 'inexistente' })).rejects.toThrow("Status 'inexistente' não encontrado");
  });

  it('deve lançar erro quando um dos gêneros por nome não for encontrado', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 8, titulo: 'Anime' });
    prismaMocks.generoFindMany.mockResolvedValueOnce([]);

    await expect(animeService.updateAnime(8, { generos: ['Inexistente'] })).rejects.toThrow("Gênero 'Inexistente' não encontrado");
  });

  it('deve atualizar anime com gêneros informados por id numérico', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 9, titulo: 'Anime' });
    prismaMocks.transaction.mockImplementationOnce(async (callback: (tx: {
      animeGenero: { deleteMany: typeof prismaMocks.animeGeneroDeleteMany; createMany: typeof prismaMocks.animeGeneroCreateMany };
      anime: { update: typeof prismaMocks.animeUpdate };
    }) => Promise<unknown>) => callback({
      animeGenero: { deleteMany: prismaMocks.animeGeneroDeleteMany, createMany: prismaMocks.animeGeneroCreateMany },
      anime: { update: prismaMocks.animeUpdate },
    }));
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 9, titulo: 'Anime' });

    await animeService.updateAnime(9, { generos: [1, 2] });

    expect(prismaMocks.animeGeneroCreateMany).toHaveBeenCalledWith({
      data: [
        { animeId: 9, generoId: 1 },
        { animeId: 9, generoId: 2 },
      ],
      skipDuplicates: true,
    });
  });

  it('deve rejeitar exclusão de anime que não existe', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce(null);

    await expect(animeService.deleteAnime(123)).rejects.toThrow('Anime não encontrado');
  });

  it('deve excluir anime e limpar do cache', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 123, titulo: 'Anime Para Excluir' });
    prismaMocks.animeDelete.mockResolvedValueOnce({ id: 123 });

    await animeService.deleteAnime(123);

    expect(prismaMocks.animeDelete).toHaveBeenCalledWith({ where: { id: 123 } });
    expect(nodeCacheMocks.del).toHaveBeenCalledWith('anime:123');
  });

  it('deve rejeitar batch upsert com lista vazia', async () => {
    await expect(animeService.batchUpsertAnimes([])).rejects.toThrow('Informe pelo menos um anime');
  });

  it('deve rejeitar batch upsert com id de anime inválido', async () => {
    await expect(animeService.batchUpsertAnimes([{ id: -5 }])).rejects.toThrow('ID do anime inválido');
  });

  it('deve processar batch upsert criando e atualizando animes', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 1, titulo: 'Existente' });
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 1, titulo: 'Atualizado' });
    prismaMocks.queryRaw.mockResolvedValueOnce([]);
    prismaMocks.animeCreate.mockResolvedValueOnce({ id: 2, titulo: 'Novo' });

    const resultado = await animeService.batchUpsertAnimes([
      { id: 1, titulo: 'Atualizado' },
      { titulo: 'Novo' },
    ]);

    expect(resultado).toEqual([
      { id: 1, titulo: 'Atualizado' },
      { id: 2, titulo: 'Novo' },
    ]);
  });
});