import { api } from './api';
import type { AnimeData } from '../types/AnimeData';

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

interface Estudio {
  id: number;
  nome: string;
}

interface Status {
  id: number;
  nome: string;
}

interface Franquia {
  id: number;
  nome: string;
}

interface Estacao {
  id: number;
  nome: string;
}

const ESTACOES_FALLBACK = new Map<number, string>([
  [1, 'Primavera'],
  [2, 'Verão'],
  [3, 'Outono'],
  [4, 'Inverno'],
]);

type AnimeComEstudio = Omit<AnimeData, 'estudio' | 'estudioId' | 'status' | 'franquia' | 'estacao'> & {
  estudio?: string | Estudio | null;
  status?: string | Status | null;
  franquia?: string | Franquia | null;
  estacao?: string | Estacao | null;
  estudioId?: number;
  franquiaId?: number;
  estacaoId?: number;
};

interface GeneroRelacionamento {
  genero?: {
    nome?: string;
  } | null;
  nome?: string;
}

type AnimeDetalhado = Omit<AnimeData, 'generos' | 'estudio' | 'estudioId' | 'status' | 'franquia' | 'estacao'> & {
  generos?: Array<string | GeneroRelacionamento | null>;
  estudio?: string | Estudio | null;
  status?: string | Status | null;
  franquia?: string | Franquia | null;
  estacao?: string | Estacao | null;
  estudioId?: number;
  franquiaId?: number;
  estacaoId?: number;
};

interface RespostaAnimesPaginada {
  items?: AnimeComEstudio[];
  total?: number;
  page?: number;
  perPage?: number;
}

const normalizeStudio = (item: AnimeComEstudio): AnimeComEstudio => {
  if (typeof item.estudio === 'string') {
    return item;
  }

  if (item.estudio && typeof item.estudio === 'object') {
    return {
      ...item,
      estudio: item.estudio.nome || '',
    };
  }

  return item;
};

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
    const estudios = estudiosResponse.data;

    const map = new Map<number, string>();

    estudios.forEach((estudio) => {
      map.set(Number(estudio.id), estudio.nome);
    });

    return items.map((item) => {
      if (
        (!item.estudio || item.estudio === '') &&
        item.estudioId !== undefined &&
        item.estudioId !== null
      ) {
        return {
          ...item,
          estudio: map.get(Number(item.estudioId)) || '',
        };
      }

      return item;
    });
  } catch {
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
    const map = new Map<number, string>();

    estacoesResponse.data.forEach((estacao) => {
      map.set(Number(estacao.id), estacao.nome);
    });

    return items.map((item) => {
      if (
        (!item.estacao || item.estacao === '') &&
        item.estacaoId !== undefined &&
        item.estacaoId !== null
      ) {
        return {
          ...item,
          estacao:
            map.get(Number(item.estacaoId)) ||
            ESTACOES_FALLBACK.get(Number(item.estacaoId)) ||
            '',
        };
      }

      return item;
    });
  } catch {
    return items.map((item) => ({
      ...item,
      estacao:
        typeof item.estacao === 'string'
          ? item.estacao
          : ESTACOES_FALLBACK.get(Number(item.estacaoId)) || '',
    }));
  }
};

const toAnimeData = (item: AnimeComEstudio): AnimeData => ({
  ...item,
  temporada: Number(item.temporada ?? 0),
  quantidadeEpisodios: Number(item.quantidadeEpisodios ?? 0),
  franquiaId: item.franquiaId ?? undefined,
  estacaoId: item.estacaoId ?? undefined,
  estacao:
    typeof item.estacao === 'string'
      ? item.estacao
      : item.estacao?.nome ||
        ESTACOES_FALLBACK.get(Number(item.estacaoId)) ||
        undefined,
  estudio: typeof item.estudio === 'string' ? item.estudio : undefined,
  status:
    typeof item.status === 'string'
      ? item.status
      : item.status?.nome || undefined,
  franquia:
    typeof item.franquia === 'string'
      ? item.franquia
      : item.franquia?.nome || undefined,
  estudioId: item.estudioId ?? undefined,
});

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

  buscarAnimes: async (query: string): Promise<AnimeData[]> => {
    const response = await api.get<AnimeData[]>('/animes/search', {
      params: {
        query,
      },
    });

    return response.data;
  },

  buscarAnime: async (id: number): Promise<AnimeData> => {
    const response = await api.get<AnimeDetalhado>(`/animes/${id}`, {
      params: {
        relations: true,
      },
    });

    const data = response.data;

    if (Array.isArray(data.generos)) {
      data.generos = data.generos.map((genero) => {
        if (!genero) {
          return String(genero);
        }

        if (typeof genero === 'string') {
          return genero;
        }

        if (
          genero.genero &&
          typeof genero.genero.nome === 'string'
        ) {
          return genero.genero.nome;
        }

        if (typeof genero.nome === 'string') {
          return genero.nome;
        }

        return String(genero);
      });
    }

    if (data.estudio && typeof data.estudio === 'object') {
      data.estudio = data.estudio.nome || '';
    }

    if (data.status && typeof data.status === 'object') {
      data.status = data.status.nome || '';
    }

    if (data.franquia && typeof data.franquia === 'object') {
      data.franquia = data.franquia.nome || '';
    }

    if (data.estacao && typeof data.estacao === 'object') {
      data.estacao = data.estacao.nome || '';
    }

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
      } catch {
        data.estacao = ESTACOES_FALLBACK.get(Number(data.estacaoId)) || '';
      }
    }

    return {
      ...data,
      temporada: Number(data.temporada ?? 0),
      quantidadeEpisodios: Number(data.quantidadeEpisodios ?? 0),
      franquiaId: data.franquiaId ?? undefined,
      estacaoId: data.estacaoId ?? undefined,
      estacao:
        typeof data.estacao === 'string'
          ? data.estacao
          : ESTACOES_FALLBACK.get(Number(data.estacaoId)) || undefined,
      estudio: typeof data.estudio === 'string' ? data.estudio : undefined,
      status: typeof data.status === 'string' ? data.status : undefined,
      franquia: typeof data.franquia === 'string' ? data.franquia : undefined,
      estudioId: data.estudioId ?? undefined,
    } as AnimeData;
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

  excluirAnime: async (id: number) => {
    const response = await api.delete(`/animes/${id}`);
    return response.data;
  },
};