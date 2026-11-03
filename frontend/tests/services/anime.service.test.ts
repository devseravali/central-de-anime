import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { api } from '../../src/services/api';
import { animeService } from '../../src/services/anime.service';
import type { AnimeData } from '../../src/types/AnimeData';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);

const response = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});

const animeFixture = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  titulo: 'Anime de teste',
  tipo: 'TV',
  temporada: 1,
  ano: 2024,
  quantidadeEpisodios: 12,
  statusId: 1,
  sinopse: 'Sinopse.',
  capaUrl: '/capas/anime.jpg',
  ...overrides,
});

describe('animeService', () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it('lista itens de uma resposta em array com relações, lookups e paginação solicitada', async () => {
    apiGet.mockImplementation(async (url) => {
      if (url === '/animes') {
        return response([
          animeFixture({
            estudioId: 4,
            estacaoId: 2,
            estudio: null,
            estacao: null,
          }),
        ]);
      }
      if (url === '/estudios') {
        return response([{ id: 4, nome: 'Estúdio A' }]);
      }
      if (url === '/estacoes') {
        return response([{ id: 2, nome: 'Estação de verão' }]);
      }
      throw new Error(`URL inesperada: ${url}`);
    });

    const result = await animeService.listarAnimes({ page: 3, perPage: 10 });

    expect(apiGet).toHaveBeenNthCalledWith(1, '/animes', {
      params: { page: 3, perPage: 10, relations: true },
    });
    expect(apiGet).toHaveBeenNthCalledWith(2, '/estudios');
    expect(apiGet).toHaveBeenNthCalledWith(3, '/estacoes');
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: 1,
          estudio: 'Estúdio A',
          estacao: 'Estação de verão',
        }),
      ],
      total: 1,
      page: 3,
      perPage: 10,
    });
  });

  it('usa metadados padrão para payload paginado incompleto e aceita lista vazia', async () => {
    apiGet.mockResolvedValue(response({ items: [] }));

    await expect(animeService.listarAnimes()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
    });
    expect(apiGet).toHaveBeenCalledOnce();
  });

  it('usa comprimento do array como total e perPage padrão quando params estão ausentes', async () => {
    apiGet.mockResolvedValue(
      response([animeFixture(), animeFixture({ id: 2 })]),
    );

    await expect(animeService.listarAnimes()).resolves.toMatchObject({
      total: 2,
      page: 1,
      perPage: 2,
    });
  });

  it('busca animes enviando query e paginação, normalizando relação textual', async () => {
    apiGet.mockResolvedValue(
      response({
        items: [animeFixture({ estudio: { id: 8, nome: 'Estúdio B' } })],
        total: 5,
        page: 2,
        perPage: 2,
      }),
    );

    const result = await animeService.buscarAnimes('aventura', {
      page: 2,
      perPage: 2,
    });

    expect(apiGet).toHaveBeenCalledWith('/animes/search', {
      params: { query: 'aventura', limit: 2, page: 2 },
    });
    expect(result).toMatchObject({
      total: 5,
      page: 2,
      perPage: 2,
      items: [expect.objectContaining({ estudio: 'Estúdio B' })],
    });
  });

  it('busca detalhes com relações e completa estação pelo fallback se lookup falhar', async () => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiGet.mockImplementation(async (url) => {
      if (url === '/animes/3') {
        return response(animeFixture({ id: 3, estacaoId: 4, estacao: null }));
      }
      if (url === '/estacoes') {
        throw new Error('Lookup indisponível');
      }
      throw new Error(`URL inesperada: ${url}`);
    });

    const result = await animeService.buscarAnime(3);

    expect(apiGet).toHaveBeenNthCalledWith(1, '/animes/3', {
      params: { relations: true },
    });
    expect(result).toMatchObject({ id: 3, estacao: 'Inverno' });
    expect(logError).toHaveBeenCalledOnce();
    logError.mockRestore();
  });

  it('não consulta lookups quando as relações já estão preenchidas', async () => {
    apiGet.mockResolvedValue(
      response(animeFixture({ estudio: 'Estúdio A', estacao: 'Primavera' })),
    );

    const result = await animeService.buscarAnime(1);

    expect(result).toMatchObject({
      estudio: 'Estúdio A',
      estacao: 'Primavera',
    });
    expect(apiGet).toHaveBeenCalledOnce();
  });

  it('propaga falhas da busca principal e rejeita a busca de detalhes', async () => {
    const failure = new Error('API indisponível');
    apiGet.mockRejectedValue(failure);

    await expect(animeService.listarAnimes()).rejects.toBe(failure);
    await expect(animeService.buscarAnimes('teste')).rejects.toBe(failure);
    await expect(animeService.buscarAnime(1)).rejects.toBe(failure);
  });

  it('encaminha criação, atualização e exclusão aos endpoints correspondentes', async () => {
    const anime = animeFixture() as AnimeData;
    api.post = vi.fn().mockResolvedValue(response(anime));
    api.put = vi.fn().mockResolvedValue(response(anime));
    api.delete = vi.fn().mockResolvedValue(response(undefined));

    await expect(animeService.criarAnime(anime)).resolves.toEqual(anime);
    await expect(animeService.atualizarAnime(1, { titulo: 'Novo título' }))
      .resolves.toEqual(anime);
    await expect(animeService.excluirAnime(1)).resolves.toBeUndefined();

    expect(api.post).toHaveBeenCalledWith('/animes', anime);
    expect(api.put).toHaveBeenCalledWith('/animes/1', {
      titulo: 'Novo título',
    });
    expect(api.delete).toHaveBeenCalledWith('/animes/1');
  });
});
