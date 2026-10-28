import { api } from './api';
import type { AnimeData } from '../types/AnimeData';
import {
  applyStationFallback,
  fillStationsFromLookup,
  fillStudiosFromLookup,
  normalizeAnimeDetails,
  normalizeAnimeRelations,
  normalizeStudio,
  toAnimeData,
  type AnimeComEstudio,
  type AnimeDetalhado,
  type Estacao,
  type Estudio,
} from '../utils/animeNormalization';

interface ListarAnimesParams {
  page?: number;
  perPage?: number;
}

export interface ListarAnimesResponse {
  items: AnimeData[];
  total: number;
  page: number;
  perPage: number;
}

interface RespostaAnimesPaginada {
  items?: AnimeComEstudio[];
  total?: number;
  page?: number;
  perPage?: number;
}

interface RespostaBuscaAnimes {
  items: AnimeComEstudio[];
  total: number;
  page: number;
  perPage: number;
}

const fillStudiosFromMap = async (
  items: AnimeComEstudio[]
): Promise<AnimeComEstudio[]> => {
  const needMap = items.some(
    (item) =>
      !item.estudio &&
      item.estudioId !== undefined &&
      item.estudioId !== null
  );

  if (!needMap) {
    return items;
  }

  try {
    const estudiosResponse = await api.get<Estudio[]>('/estudios');
    return fillStudiosFromLookup(items, estudiosResponse.data);
  } catch (error) {
    console.error('Falha ao buscar estúdios para completar animes:', error);
    return items;
  }
};

const fillEstacoesFromMap = async (
  items: AnimeComEstudio[]
): Promise<AnimeComEstudio[]> => {
  const needMap = items.some(
    (item) =>
      !item.estacao &&
      item.estacaoId !== undefined &&
      item.estacaoId !== null
  );

  if (!needMap) {
    return items;
  }

  try {
    const estacoesResponse = await api.get<Estacao[]>('/estacoes');
    return fillStationsFromLookup(items, estacoesResponse.data);
  } catch (error) {
    console.error('Falha ao buscar estações para completar animes:', error);
    return applyStationFallback(items);
  }
};

export const animeService = {
  listarAnimes: async (
    params: ListarAnimesParams = {}
  ): Promise<ListarAnimesResponse> => {
    const response = await api.get<
      AnimeComEstudio[] | RespostaAnimesPaginada
    >('/animes', {
      params: {
        ...params,
        relations: true,
      },
    });

    const payload = response.data;

    if (Array.isArray(payload)) {
      const page = params.page ?? 1;
      const perPage = params.perPage ?? payload.length;

      let items = payload.map(normalizeStudio);
      items = await fillStudiosFromMap(items);
      items = await fillEstacoesFromMap(items);

      return {
        items: items.map(toAnimeData),
        total: payload.length,
        page,
        perPage,
      };
    }

    let items = Array.isArray(payload.items)
      ? payload.items.map(normalizeStudio)
      : [];

    items = await fillStudiosFromMap(items);
    items = await fillEstacoesFromMap(items);

    return {
      items: items.map(toAnimeData),
      total: typeof payload.total === 'number' ? payload.total : 0,
      page: typeof payload.page === 'number' ? payload.page : params.page ?? 1,
      perPage:
        typeof payload.perPage === 'number'
          ? payload.perPage
          : params.perPage ?? 20,
    };
  },

  buscarAnimes: async (
    query: string,
    params: ListarAnimesParams = {}
  ): Promise<ListarAnimesResponse> => {
    const response = await api.get<RespostaBuscaAnimes>('/animes/search', {
      params: {
        query,
        limit: params.perPage,
        page: params.page,
      },
    });

    const payload = response.data;
    let items = Array.isArray(payload.items)
      ? payload.items.map(normalizeStudio)
      : [];

    items = await fillStudiosFromMap(items);
    items = await fillEstacoesFromMap(items);

    return {
      items: items.map(toAnimeData),
      total: typeof payload.total === 'number' ? payload.total : 0,
      page: typeof payload.page === 'number' ? payload.page : params.page ?? 1,
      perPage:
        typeof payload.perPage === 'number'
          ? payload.perPage
          : params.perPage ?? 20,
    };
  },

  buscarAnime: async (id: number): Promise<AnimeData> => {
    const response = await api.get<AnimeDetalhado>(`/animes/${id}`, {
      params: {
        relations: true,
      },
    });

    let data = normalizeAnimeRelations(response.data);

    if (!data.estudio && data.estudioId !== undefined && data.estudioId !== null) {
      try {
        const estudiosResponse = await api.get<Estudio[]>('/estudios');
        const encontrado = estudiosResponse.data.find(
          (estudio) => Number(estudio.id) === Number(data.estudioId)
        );
        if (encontrado) {
          data.estudio = encontrado.nome;
        }
      } catch (e) {
        console.error('Falha ao buscar estúdios para o anime:', e);
      }
    }

    if (!data.estacao && data.estacaoId !== undefined && data.estacaoId !== null) {
      try {
        const estacoesResponse = await api.get<Estacao[]>('/estacoes');
        const encontrada = estacoesResponse.data.find(
          (estacao) => Number(estacao.id) === Number(data.estacaoId)
        );
        if (encontrada) {
          data.estacao = encontrada.nome;
        }
      } catch (error) {
        console.error('Falha ao buscar estações para o anime:', error);
        data = {
          ...data,
          estacao: normalizeAnimeDetails(data).estacao || '',
        };
      }
    }

    return normalizeAnimeDetails(data);
  },

  criarAnime: async (data: AnimeData) => {
    const response = await api.post<AnimeData>('/animes', data);
    return response.data;
  },

  atualizarAnime: async (
    id: number,
    data: Partial<AnimeData>
  ) => {
    const response = await api.put<AnimeData>(
      `/animes/${id}`,
      data
    );

    return response.data;
  },

  excluirAnime: async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/animes/${id}`);
    return response.data;
  },
};