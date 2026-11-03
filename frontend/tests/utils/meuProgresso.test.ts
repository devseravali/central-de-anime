import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildAnimeProgressItems,
  getProgressPercentage,
} from '../../src/utils/meuProgresso';
import type { AnimeData } from '../../src/types/AnimeData';
import type { Episodio } from '../../src/types/Episodio';
import type { ProgressoEpisodio } from '../../src/services/progresso.service';

describe('getProgressPercentage', () => {
  it.each([
    [{ episodiosAssistidos: 1, totalEpisodios: 4 }, 25],
    [{ episodiosAssistidos: 1, totalEpisodios: 3 }, 33],
    [{ episodiosAssistidos: 8, totalEpisodios: 4 }, 100],
    [{ episodiosAssistidos: -1, totalEpisodios: 4 }, 0],
    [{ episodiosAssistidos: 1, totalEpisodios: 0 }, 0],
  ] as const)('calcula progresso limitado dentro de 0–100', (item, expected) => {
    expect(getProgressPercentage(item)).toBe(expected);
  });
});

describe('buildAnimeProgressItems', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('agrega episódios assistidos, status, próximo episódio e metadados do anime', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

    const episodes: Episodio[] = [
      { id: 12, animeId: 7, titulo: 'Final', numero: 2 },
      { id: 11, animeId: 7, titulo: 'Início', numero: 1 },
      { id: 99, titulo: 'Sem anime associado', numero: 1 },
    ];
    const progress: ProgressoEpisodio[] = [
      {
        usuarioId: 1,
        episodioId: 11,
        segundosAssistidos: 1200,
        porcentagem: 100,
        assistido: true,
        atualizadoEm: '2025-01-15T11:00:00.000Z',
        episodio: {
          anime: { id: 7, titulo: 'Aventura no Espaço' },
        },
      },
    ];
    const animeById: Record<number, AnimeData> = {
      7: {
        id: 7,
        titulo: 'Aventura no Espaço',
        tipo: 'TV',
        temporada: 1,
        ano: 2024,
        quantidadeEpisodios: 2,
        statusId: 1,
        sinopse: '',
        capaUrl: '',
        estacaoId: 3,
      },
    };

    expect(buildAnimeProgressItems(episodes, progress, animeById)).toEqual([
      {
        id: 7,
        titulo: 'Aventura no Espaço',
        subtitulo: 'Anime #7',
        temporada: 'Outono',
        totalEpisodios: 2,
        episodiosAssistidos: 1,
        status: 'assistindo',
        proximoEpisodio: 'Ep. 2 - Final',
        ultimaAtualizacao: 'Ha 1h',
        ultimaAtualizacaoOrdem: Date.parse('2025-01-15T11:00:00.000Z'),
        semanaAssistidos: 1,
        sigla: 'AN',
      },
    ]);
  });

  it('usa registro de progresso como total se episódios do anime não estiverem disponíveis', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

    const progress: ProgressoEpisodio[] = [
      {
        usuarioId: 1,
        episodioId: 2,
        segundosAssistidos: 10,
        porcentagem: 100,
        assistido: false,
        episodio: { anime: { id: 9 } },
      },
      {
        usuarioId: 1,
        episodioId: 3,
        segundosAssistidos: 10,
        porcentagem: 0,
        assistido: false,
        episodio: { anime: { id: 9 } },
      },
    ];

    expect(buildAnimeProgressItems([], progress, {})).toMatchObject([
      {
        id: 9,
        titulo: 'Anime #9',
        temporada: 'Temporada nao informada',
        totalEpisodios: 2,
        episodiosAssistidos: 1,
        status: 'assistindo',
        proximoEpisodio: 'Temporada finalizada',
        sigla: 'A#',
      },
    ]);
  });
});
