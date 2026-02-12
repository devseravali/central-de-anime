import { db } from '../db';
import { sql } from 'drizzle-orm';

import type {
  EstacaoPopular,
  TemporadaPopular,
  AnimePopular,
} from '../types/estatisticas';
import type { Estacao } from '../types/estacao';
import type { Temporada } from '../types/temporada';
import type { Anime } from '../types/anime';
import type { Plataforma } from '../types/plataforma';
import type { Tag } from '../types/tag';
import type { Status } from '../types/status';
import type { Genero } from '../types/genero';
import type { Estudio } from '../types/estudio';

import { contarTabela } from '../helpers/dbHelpers';

import { generos } from '../schema/generos';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { temporadas } from '../schema/temporadas';
import { estudios } from '../schema/estudios';
import { estacoes } from '../schema/estacoes';
import { animes } from '../schema/animes';
import { personagens } from '../schema/personagens';
import { anime_personagem } from '../schema/anime_personagem';

export const estatisticasRepositorio = {
  contarAnimes: () => contarTabela(animes),
  contarEstudios: () => contarTabela(estudios),
  contarGeneros: () => contarTabela(generos),
  contarPlataformas: () => contarTabela(plataformas),
  contarStatus: () => contarTabela(status),
  contarTags: () => contarTabela(tags),
  contarTemporadas: () => contarTabela(temporadas),
  contarEstacoes: () => contarTabela(estacoes),
  contarPersonagens: () => contarTabela(personagens),

  async listarPlataformasPopulares(
    limit = 5,
  ): Promise<(Plataforma & { totalAnimes: number })[]> {
    const { anime_plataforma } = await import('../schema/anime_plataforma');

    return db
      .select({
        id: plataformas.id,
        nome: plataformas.nome,
        totalAnimes: sql<number>`COUNT(anime_plataforma.anime_id)`,
      })
      .from(plataformas)
      .leftJoin(
        anime_plataforma,
        sql`anime_plataforma.plataforma_id = plataformas.id`,
      )
      .groupBy(plataformas.id)
      .orderBy(sql`COUNT(anime_plataforma.anime_id) DESC`)
      .limit(limit) as Promise<(Plataforma & { totalAnimes: number })[]>;
  },

  async listarEstacoesPopulares(
    limit = 5,
  ): Promise<(Estacao & { total: number })[]> {
    return db
      .select({
        id: estacoes.id,
        nome: estacoes.nome,
        total: sql<number>`COUNT(*)`,
      })
      .from(estacoes)
      .groupBy(estacoes.id)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit) as Promise<(Estacao & { total: number })[]>;
  },

  async listarTemporadasPopulares(
    ano?: string,
    limit = 5,
  ): Promise<(Temporada & { episodios: number; slug: string })[]> {
    const base = db
      .select({
        id: temporadas.id,
        nome: temporadas.nome,
        episodios: temporadas.episodios,
        ano: temporadas.ano,
        slug: temporadas.slug,
      })
      .from(temporadas);

    const result = ano
      ? await base
          .where(sql`temporadas.ano = ${ano}`)
          .orderBy(sql`episodios DESC`)
          .limit(limit)
      : await base.orderBy(sql`episodios DESC`).limit(limit);

    return result
      .filter(
        (item) =>
          item.nome !== null &&
          item.episodios !== null &&
          item.slug !== null &&
          item.ano !== null,
      )
      .map((item) => ({
        id: item.id,
        nome: item.nome as string,
        episodios: item.episodios as number,
        slug: item.slug as string,
        ano: typeof item.ano === 'number' ? item.ano : Number(item.ano),
        animeId: (item as any).animeId ?? 0,
        tipo: (item as any).tipo ?? '',
        temporada: (item as any).temporada ?? 0,
        statusId: (item as any).statusId ?? 0,
        estacaoId: (item as any).estacaoId ?? 0,
        sinopse: (item as any).sinopse ?? undefined,
      })) as (Temporada & { episodios: number; slug: string })[];
  },

  async listarAnimesPopulares(
    ano?: string,
    limit = 5,
  ): Promise<(Anime & { totalPersonagens: number })[]> {
    const base = db
      .select({
        id: animes.id,
        nome: animes.nome,
        totalPersonagens: sql<number>`COUNT(anime_personagem.personagem_id)`,
      })
      .from(animes)
      .leftJoin(anime_personagem, sql`anime_personagem.anime_id = animes.id`)
      .groupBy(animes.id);

    return ano
      ? ((await base
          .where(sql`animes.ano = ${ano}`)
          .orderBy(sql`COUNT(anime_personagem.personagem_id) DESC`)
          .limit(limit)) as (Anime & { totalPersonagens: number })[])
      : ((await base
          .orderBy(sql`COUNT(anime_personagem.personagem_id) DESC`)
          .limit(limit)) as (Anime & { totalPersonagens: number })[]);
  },
  async listarTagsPopulares(
    limit = 5,
  ): Promise<(Tag & { totalAnimes: number })[]> {
    const { anime_tag } = await import('../schema/anime_tag');
    return db
      .select({
        id: tags.id,
        nome: tags.nome,
        totalAnimes: sql<number>`COUNT(anime_tag.anime_id)`,
      })
      .from(tags)
      .leftJoin(anime_tag, sql`anime_tag.tag_id = tags.id`)
      .groupBy(tags.id)
      .orderBy(sql`COUNT(anime_tag.anime_id) DESC`)
      .limit(limit) as Promise<(Tag & { totalAnimes: number })[]>;
  },

  async listarStatusPopulares(
    limit = 5,
  ): Promise<(Status & { totalAnimes: number })[]> {
    const { anime_status } = await import('../schema/anime_status');
    return db
      .select({
        id: status.id,
        nome: status.nome,
        totalAnimes: sql<number>`COUNT(anime_status.anime_id)`,
      })
      .from(status)
      .leftJoin(anime_status, sql`anime_status.status_id = status.id`)
      .groupBy(status.id)
      .orderBy(sql`COUNT(anime_status.anime_id) DESC`)
      .limit(limit) as Promise<(Status & { totalAnimes: number })[]>;
  },

  async listarGenerosPopulares(
    limit = 5,
  ): Promise<(Genero & { totalAnimes: number })[]> {
    const { anime_genero } = await import('../schema/anime_genero');
    return db
      .select({
        id: generos.id,
        nome: generos.nome,
        totalAnimes: sql<number>`COUNT(anime_genero.anime_id)`,
      })
      .from(generos)
      .leftJoin(anime_genero, sql`anime_genero.genero_id = generos.id`)
      .groupBy(generos.id)
      .orderBy(sql`COUNT(anime_genero.anime_id) DESC`)
      .limit(limit) as Promise<(Genero & { totalAnimes: number })[]>;
  },

  async listarEstudiosPopulares(
    limit = 5,
  ): Promise<(Estudio & { totalAnimes: number })[]> {
    const { anime_estudio } = await import('../schema/anime_estudio');
    return db
      .select({
        id: estudios.id,
        nome: estudios.nome,
        principaisObras: estudios.principaisObras,
        totalAnimes: sql<number>`COUNT(anime_estudio.anime_id)`,
      })
      .from(estudios)
      .leftJoin(anime_estudio, sql`anime_estudio.estudio_id = estudios.id`)
      .groupBy(estudios.id, estudios.principaisObras)
      .orderBy(sql`COUNT(anime_estudio.anime_id) DESC`)
      .limit(limit) as Promise<(Estudio & { totalAnimes: number })[]>;
  },
};
