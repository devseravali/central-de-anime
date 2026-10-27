import type { AnimeData } from '../types/AnimeData';
import type { Episodio } from '../types/Episodio';
import type { ProgressoEpisodio } from '../services/progresso.service';

export type ProgressStatus =
  | 'assistindo'
  | 'completo'
  | 'pausado'
  | 'planejado'
  | 'desistido';

export type AnimeProgressItem = {
  id: number;
  titulo: string;
  subtitulo: string;
  temporada: string;
  totalEpisodios: number;
  episodiosAssistidos: number;
  status: ProgressStatus;
  proximoEpisodio: string;
  ultimaAtualizacao: string;
  ultimaAtualizacaoOrdem: number;
  semanaAssistidos: number;
  sigla: string;
};

export const getProgressPercentage = (
  item: Pick<
    AnimeProgressItem,
    'episodiosAssistidos' | 'totalEpisodios'
  >,
): number =>
  item.totalEpisodios > 0
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round((item.episodiosAssistidos / item.totalEpisodios) * 100),
        ),
      )
    : 0;

const obterTemporadaAtual = (
  date: Date,
): 'verao' | 'outono' | 'inverno' | 'primavera' => {
  const mesEmToquio = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo',
      month: 'numeric',
    }).format(date),
  );

  if (mesEmToquio <= 3) {
    return 'inverno';
  }

  if (mesEmToquio <= 6) {
    return 'primavera';
  }

  if (mesEmToquio <= 9) {
    return 'verao';
  }

  return 'outono';
};

export const getCurrentAnimeSeason = (): string =>
  obterTemporadaAtual(new Date());

const toSigla = (titulo: string): string =>
  titulo
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0] ?? '')
    .join('')
    .toUpperCase() || 'AN';

const formatarAtualizacao = (iso?: string): string => {
  if (!iso) {
    return 'Sem atualizacao';
  }

  const timestamp = Date.parse(iso);

  if (Number.isNaN(timestamp)) {
    return 'Atualizado recentemente';
  }

  const diffHoras = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));

  if (diffHoras <= 0) {
    return 'Atualizado agora';
  }

  if (diffHoras < 24) {
    return `Ha ${diffHoras}h`;
  }

  const diffDias = Math.floor(diffHoras / 24);

  if (diffDias === 1) {
    return 'Ontem';
  }

  if (diffDias < 7) {
    return `Ha ${diffDias} dias`;
  }

  const diffSemanas = Math.floor(diffDias / 7);
  return `Ha ${diffSemanas} semana${diffSemanas > 1 ? 's' : ''}`;
};

const ordenarEpisodios = (episodes: Episodio[]): Episodio[] =>
  [...episodes].sort((a, b) => {
    const numberA =
      typeof a.numero === 'number' ? a.numero : Number.MAX_SAFE_INTEGER;
    const numberB =
      typeof b.numero === 'number' ? b.numero : Number.MAX_SAFE_INTEGER;

    return numberA === numberB ? a.id - b.id : numberA - numberB;
  });

const toSeasonLabel = (anime?: AnimeData): string => {
  const season = String(anime?.estacao ?? '').trim();

  if (season) {
    return season;
  }

  const seasonsById: Record<number, string> = {
    1: 'Primavera',
    2: 'Verão',
    3: 'Outono',
    4: 'Inverno',
  };

  if (typeof anime?.estacaoId === 'number' && seasonsById[anime.estacaoId]) {
    return seasonsById[anime.estacaoId];
  }

  return 'Temporada nao informada';
};

export const getWeeklyProgressActivity = (
  progress: ProgressoEpisodio[],
): number[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dayInMs = 24 * 60 * 60 * 1000;
  const days = Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(startOfToday.getTime() - (6 - index) * dayInMs);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  });
  const countByDay = new Map<string, number>(days.map((day) => [day, 0]));

  progress.forEach((record) => {
    if (!record.atualizadoEm) {
      return;
    }

    const timestamp = Date.parse(record.atualizadoEm);

    if (Number.isNaN(timestamp)) {
      return;
    }

    const date = new Date(timestamp);
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (countByDay.has(day)) {
      countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
    }
  });

  const counts = days.map((day) => countByDay.get(day) ?? 0);
  const maximum = Math.max(...counts, 0);

  return maximum > 0
    ? counts.map((count) => Math.round((count / maximum) * 100))
    : [0, 0, 0, 0, 0, 0, 0];
};

export const buildAnimeProgressItems = (
  episodes: Episodio[],
  progress: ProgressoEpisodio[],
  animeById: Record<number, AnimeData>,
): AnimeProgressItem[] => {
  const episodesByAnime = episodes.reduce<Record<number, Episodio[]>>(
    (result, episode) => {
      if (typeof episode.animeId === 'number') {
        (result[episode.animeId] ??= []).push(episode);
      }

      return result;
    },
    {},
  );
  const progressByAnime = new Map<number, ProgressoEpisodio[]>();

  progress.forEach((record) => {
    const animeId = record.episodio?.anime?.id;

    if (typeof animeId === 'number') {
      const current = progressByAnime.get(animeId) ?? [];
      current.push(record);
      progressByAnime.set(animeId, current);
    }
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return Array.from(progressByAnime.entries()).map(([animeId, records]) => {
    const animeEpisodes = ordenarEpisodios(episodesByAnime[animeId] ?? []);
    const watched = new Set(
      records
        .filter((record) => record.assistido || record.porcentagem >= 100)
        .map((record) => record.episodioId),
    );
    const totalEpisodes =
      animeEpisodes.length > 0 ? animeEpisodes.length : records.length;
    const watchedEpisodes = watched.size;
    const status: ProgressStatus =
      watchedEpisodes === 0
        ? 'planejado'
        : watchedEpisodes >= totalEpisodes
          ? 'completo'
          : 'assistindo';
    const latestRecord = [...records].sort((a, b) => {
      const dateA = Date.parse(a.atualizadoEm ?? '');
      const dateB = Date.parse(b.atualizadoEm ?? '');
      return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
    })[0];
    const nextEpisode = animeEpisodes.find((episode) => !watched.has(episode.id));
    const animeTitle =
      records[0]?.episodio?.anime?.titulo ?? `Anime #${animeId}`;
    const weeklyWatched = records.filter((record) => {
      const timestamp = Date.parse(record.atualizadoEm ?? '');
      return (
        !Number.isNaN(timestamp) &&
        timestamp >= sevenDaysAgo &&
        (record.assistido || record.porcentagem >= 100)
      );
    }).length;

    return {
      id: animeId,
      titulo: animeTitle,
      subtitulo: `Anime #${animeId}`,
      temporada: toSeasonLabel(animeById[animeId]),
      totalEpisodios: totalEpisodes,
      episodiosAssistidos: watchedEpisodes,
      status,
      proximoEpisodio: nextEpisode
        ? `Ep. ${nextEpisode.numero ?? nextEpisode.id} - ${nextEpisode.titulo ?? 'Sem titulo'}`
        : 'Temporada finalizada',
      ultimaAtualizacao: formatarAtualizacao(latestRecord?.atualizadoEm),
      ultimaAtualizacaoOrdem: Date.parse(latestRecord?.atualizadoEm ?? '') || 0,
      semanaAssistidos: weeklyWatched,
      sigla: toSigla(animeTitle),
    };
  });
};
