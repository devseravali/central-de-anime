import { describe, expect, it } from 'vitest';
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
} from '../../src/utils/animeNormalization';

const createAnimeDetails = (
  overrides: Partial<AnimeDetalhado> = {},
): AnimeDetalhado => ({
  id: 1,
  titulo: 'Anime de exemplo',
  tipo: 'TV',
  temporada: 1,
  ano: 2024,
  quantidadeEpisodios: 12,
  statusId: 1,
  sinopse: 'Sinopse de exemplo.',
  capaUrl: '/capas/anime-exemplo.jpg',
  ...overrides,
});

describe('normalizeAnimeDetails', () => {
  it('converte relações e gêneros da API para os valores consumidos pela interface', () => {
    const anime = createAnimeDetails({
      estudio: { id: 7, nome: 'Estúdio de exemplo' },
      status: { id: 1, nome: 'Finalizado' },
      franquia: { id: 3, nome: 'Franquia de exemplo' },
      estacao: { id: 2, nome: 'Verão' },
      generos: [
        'Ação',
        { genero: { nome: 'Aventura' } },
        { nome: 'Fantasia' },
        null,
        { nome: '   ' },
        '',
      ],
    });

    const normalized = normalizeAnimeDetails(anime);

    expect(normalized).toMatchObject({
      estudio: 'Estúdio de exemplo',
      status: 'Finalizado',
      franquia: 'Franquia de exemplo',
      estacao: 'Verão',
      generos: ['Ação', 'Aventura', 'Fantasia'],
    });
  });

  it('usa a estação correspondente ao identificador quando a relação não está incluída', () => {
    const normalized = normalizeAnimeDetails(
      createAnimeDetails({ estacaoId: 3 }),
    );

  expect(normalized.estacao).toBe('Outono');
});

it('converte valores numéricos opcionais e omite relações ausentes', () => {
  const normalized = normalizeAnimeDetails(
    createAnimeDetails({
      temporada: null as unknown as number,
      quantidadeEpisodios: undefined as unknown as number,
      estudio: null,
      status: null,
      franquia: null,
      estacao: null,
      generos: undefined,
    }),
  );

  expect(normalized).toMatchObject({
    temporada: 0,
    quantidadeEpisodios: 0,
  });
  expect(normalized.estudio).toBeUndefined();
  expect(normalized.status).toBeUndefined();
  expect(normalized.franquia).toBeUndefined();
  expect(normalized.estacao).toBeUndefined();
  expect(normalized.generos).toBeUndefined();
});

it('usa a estação reconhecida como fallback e deixa IDs desconhecidos sem estação', () => {
  expect(normalizeAnimeDetails(createAnimeDetails({ estacaoId: 4 })).estacao)
    .toBe('Inverno');
  expect(normalizeAnimeDetails(createAnimeDetails({ estacaoId: 99 })).estacao)
    .toBeUndefined();
});

it('normaliza relações de objeto e preserva relações textuais', () => {
  const normalized = normalizeAnimeRelations(
    createAnimeDetails({
      estudio: { id: 1, nome: 'Estúdio' },
      status: 'Em exibição',
      franquia: { id: 2, nome: '' },
      estacao: null,
    }),
  );

  expect(normalized.estudio).toBe('Estúdio');
  expect(normalized.status).toBe('Em exibição');
  expect(normalized.franquia).toBe('');
  expect(normalized.estacao).toBeNull();
});
});

describe('anime relation helpers', () => {
const animeWithRelations = (
  overrides: Partial<AnimeComEstudio> = {},
): AnimeComEstudio => ({
  ...createAnimeDetails(),
  ...overrides,
});

it('normaliza o nome do estúdio relacionado sem mutar o objeto original', () => {
  const anime = animeWithRelations({
    estudio: { id: 5, nome: 'Estúdio A' },
  });

  const normalized = normalizeStudio(anime);

  expect(normalized.estudio).toBe('Estúdio A');
  expect(anime.estudio).toEqual({ id: 5, nome: 'Estúdio A' });
  expect(normalizeStudio(animeWithRelations({ estudio: 'Estúdio B' })).estudio)
    .toBe('Estúdio B');
});

it('preenche estúdios faltantes pelo ID e não substitui valor existente', () => {
  const result = fillStudiosFromLookup(
    [
      animeWithRelations({ estudioId: 5, estudio: null }),
      animeWithRelations({ estudioId: 6, estudio: '' }),
      animeWithRelations({ estudioId: 5, estudio: 'Manual' }),
      animeWithRelations({ estudioId: 7 }),
    ],
    [{ id: 5, nome: 'Estúdio A' }, { id: 6, nome: 'Estúdio B' }],
  );

  expect(result.map(({ estudio }) => estudio)).toEqual([
    'Estúdio A',
    'Estúdio B',
    'Manual',
    '',
  ]);
});

it('preenche estações pelo lookup, fallback conhecido ou string vazia', () => {
  const result = fillStationsFromLookup(
    [
      animeWithRelations({ estacaoId: 7, estacao: null }),
      animeWithRelations({ estacaoId: 3, estacao: '' }),
      animeWithRelations({ estacaoId: 99, estacao: '' }),
      animeWithRelations({ estacaoId: 7, estacao: 'Outono' }),
    ],
    [{ id: 7, nome: 'Estação cadastrada' }],
  );

  expect(result.map(({ estacao }) => estacao)).toEqual([
    'Estação cadastrada',
    'Outono',
    '',
    'Outono',
  ]);
});

it('aplica fallback de estação sem apagar um nome já preenchido', () => {
  const result = applyStationFallback([
    animeWithRelations({ estacaoId: 1, estacao: null }),
    animeWithRelations({ estacaoId: 99, estacao: '' }),
    animeWithRelations({ estacaoId: 4, estacao: 'Verão' }),
  ]);

  expect(result.map(({ estacao }) => estacao)).toEqual([
    'Primavera',
    '',
    'Verão',
  ]);
});

it('converte relações para strings e garante números para os totais', () => {
  const anime = animeWithRelations({
    temporada: '2' as unknown as number,
    quantidadeEpisodios: '24' as unknown as number,
    estudio: 'Estúdio',
    status: { id: 1, nome: 'Finalizado' },
    franquia: { id: 2, nome: 'Franquia' },
    estacao: { id: 4, nome: 'Inverno' },
  });

  expect(toAnimeData(anime)).toMatchObject({
    temporada: 2,
    quantidadeEpisodios: 24,
    estudio: 'Estúdio',
    status: 'Finalizado',
    franquia: 'Franquia',
    estacao: 'Inverno',
  });
});
});
