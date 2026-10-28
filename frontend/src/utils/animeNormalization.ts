import type { AnimeData } from '../types/AnimeData';

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

type AnimeComEstudio = Omit<
  AnimeData,
  'estudio' | 'estudioId' | 'status' | 'franquia' | 'estacao'
> & {
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

export type AnimeDetalhado = Omit<
  AnimeData,
  'generos' | 'estudio' | 'estudioId' | 'status' | 'franquia' | 'estacao'
> & {
  generos?: Array<string | GeneroRelacionamento | null>;
  estudio?: string | Estudio | null;
  status?: string | Status | null;
  franquia?: string | Franquia | null;
  estacao?: string | Estacao | null;
  estudioId?: number;
  franquiaId?: number;
  estacaoId?: number;
};

const ESTACOES_FALLBACK = new Map<number, string>([
  [1, 'Primavera'],
  [2, 'Verão'],
  [3, 'Outono'],
  [4, 'Inverno'],
]);

export const normalizeStudio = (
  item: AnimeComEstudio,
): AnimeComEstudio => {
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

export const fillStudiosFromLookup = (
  items: AnimeComEstudio[],
  studios: Estudio[],
): AnimeComEstudio[] => {
  const studioById = new Map(
    studios.map((studio) => [Number(studio.id), studio.nome]),
  );

  return items.map((item) => {
    if (
      (!item.estudio || item.estudio === '') &&
      item.estudioId !== undefined &&
      item.estudioId !== null
    ) {
      return {
        ...item,
        estudio: studioById.get(Number(item.estudioId)) || '',
      };
    }

    return item;
  });
};

export const fillStationsFromLookup = (
  items: AnimeComEstudio[],
  stations: Estacao[],
): AnimeComEstudio[] => {
  const stationById = new Map(
    stations.map((station) => [Number(station.id), station.nome]),
  );

  return items.map((item) => {
    if (
      (!item.estacao || item.estacao === '') &&
      item.estacaoId !== undefined &&
      item.estacaoId !== null
    ) {
      return {
        ...item,
        estacao:
          stationById.get(Number(item.estacaoId)) ||
          ESTACOES_FALLBACK.get(Number(item.estacaoId)) ||
          '',
      };
    }

    return item;
  });
};

export const applyStationFallback = (
  items: AnimeComEstudio[],
): AnimeComEstudio[] =>
  items.map((item) => ({
    ...item,
    estacao:
      typeof item.estacao === 'string'
        ? item.estacao
        : ESTACOES_FALLBACK.get(Number(item.estacaoId)) || '',
  }));

export const toAnimeData = (item: AnimeComEstudio): AnimeData => ({
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

export const normalizeAnimeRelations = (
  data: AnimeDetalhado,
): AnimeDetalhado => ({
  ...data,
  estudio:
    typeof data.estudio === 'string'
      ? data.estudio
      : data.estudio && typeof data.estudio === 'object'
        ? data.estudio.nome || ''
        : data.estudio,
  status:
    typeof data.status === 'string'
      ? data.status
      : data.status && typeof data.status === 'object'
        ? data.status.nome || ''
        : data.status,
  franquia:
    typeof data.franquia === 'string'
      ? data.franquia
      : data.franquia && typeof data.franquia === 'object'
        ? data.franquia.nome || ''
        : data.franquia,
  estacao:
    typeof data.estacao === 'string'
      ? data.estacao
      : data.estacao && typeof data.estacao === 'object'
        ? data.estacao.nome || ''
        : data.estacao,
});

export const normalizeAnimeDetails = (
  data: AnimeDetalhado,
): AnimeData => {
  const normalizedData = normalizeAnimeRelations(data);
  const normalizedGeneros = Array.isArray(normalizedData.generos)
    ? normalizedData.generos.flatMap((genero) => {
        if (typeof genero === 'string') {
          return genero.trim() ? [genero] : [];
        }

        if (!genero) {
          return [];
        }

        const nome = genero.genero?.nome ?? genero.nome;
        return typeof nome === 'string' && nome.trim() ? [nome] : [];
      })
    : undefined;

  return {
    ...normalizedData,
    generos: normalizedGeneros,
    temporada: Number(normalizedData.temporada ?? 0),
    quantidadeEpisodios: Number(normalizedData.quantidadeEpisodios ?? 0),
    franquiaId: normalizedData.franquiaId ?? undefined,
    estacaoId: normalizedData.estacaoId ?? undefined,
    estacao:
      (typeof normalizedData.estacao === 'string'
        ? normalizedData.estacao
        : normalizedData.estacao?.nome) ||
      ESTACOES_FALLBACK.get(Number(normalizedData.estacaoId)) ||
      undefined,
    estudio:
      typeof normalizedData.estudio === 'string'
        ? normalizedData.estudio
        : undefined,
    status:
      typeof normalizedData.status === 'string'
        ? normalizedData.status
        : normalizedData.status?.nome || undefined,
    franquia:
      typeof normalizedData.franquia === 'string'
        ? normalizedData.franquia
        : normalizedData.franquia?.nome || undefined,
    estudioId: normalizedData.estudioId ?? undefined,
  };
};

export type { AnimeComEstudio, Estacao, Estudio };
