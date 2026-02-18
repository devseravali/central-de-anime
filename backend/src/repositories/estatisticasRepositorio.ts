import { db } from '../db';
import { sql } from 'drizzle-orm';

import type { Estacao } from '../types/estacao';
import type { Plataforma } from '../types/plataforma';
import type { Status } from '../types/status';
import type { Genero } from '../types/genero';
import type { Estudio } from '../types/estudio';

import { contarTabela } from '../helpers/dbHelpers';

import { generos } from '../schema/generos';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { estudios } from '../schema/estudios';
import { estacoes } from '../schema/estacoes';
import { animes } from '../schema/animes';
import { personagens } from '../schema/personagens';

export const estatisticasRepositorio = {
  contarAnimes: () => contarTabela(animes),
  contarEstudios: () => contarTabela(estudios),
  contarGeneros: () => contarTabela(generos),
  contarPlataformas: () => contarTabela(plataformas),
  contarStatus: () => contarTabela(status),
  contarTags: () => contarTabela(tags),

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

  async listarTemporadasPorAnime(
    ano?: string,
  ): Promise<{ temporada: string; ano: string; total: number }[]> {
    const whereClause = ano ? sql`ano = ${ano}` : undefined;

    const result = await db
      .select({
        temporada: animes.temporada,
        ano: animes.ano,
        total: sql<number>`COUNT(*)`,
      })
      .from(animes)
      .where(whereClause)
      .groupBy(animes.temporada, animes.ano)
      .orderBy(sql`COUNT(*) DESC`);

    return result.map((item) => ({
      temporada: item.temporada !== null ? String(item.temporada) : '',
      ano: item.ano !== null ? String(item.ano) : '',
      total: item.total,
    }));
  },
};
