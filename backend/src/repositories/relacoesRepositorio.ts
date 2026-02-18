import { db } from '../db';
import { eq, ilike } from 'drizzle-orm';

import { personagens } from '../schema/personagens';
import { generos } from '../schema/generos';
import { estudios } from '../schema/estudios';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { estacoes } from '../schema/estacoes';
import { anime_personagem } from '../schema/anime_personagem';
import { animes } from '../schema/animes';
import { anime_estudio } from '../schema/anime_estudio';
import { anime_plataforma } from '../schema/anime_plataforma';
import { anime_status } from '../schema/anime_status';
import { anime_tag } from '../schema/anime_tag';
import {
  PersonagensDeUmAnimeRow,
  AnimesDeUmPersonagemRow,
  GenerosDeUmAnimeRow,
  AnimesDeUmGeneroRow,
  EstudiosDeUmAnimeRow,
  AnimesDeUmEstudioRow,
  PlataformasDeUmAnimeRow,
  AnimesDeUmaPlataformaRow,
  StatusDeUmAnimeRow,
  AnimesDeUmStatusRow,
  TagsDeUmAnimeRow,
  AnimesDeUmaTagRow,
  Estacao,
  Anime,
  Personagem,
  Genero,
  Estudio,
  Plataforma,
  Status,
  Tag,
  EntidadesDoAnimeMap,
  AnimesDaEntidadeMap,
} from '../types/relacoes';
import { anime_genero } from '../schema/anime_genero';

export type EntidadeCanonica =
  | 'personagens'
  | 'generos'
  | 'estudios'
  | 'plataformas'
  | 'status'
  | 'tags'
  | 'estacoes';
export type AnimesDeUmaEstacaoRow = Anime & { estacao_id: number };

function canonizarEntidade(entidade: string): EntidadeCanonica | null {
  const e = entidade.trim().toLowerCase();

  if (e === 'personagem' || e === 'personagens') return 'personagens';
  if (e === 'genero' || e === 'generos') return 'generos';
  if (e === 'estudio' || e === 'estudios') return 'estudios';
  if (e === 'plataforma' || e === 'plataformas') return 'plataformas';
  if (e === 'status') return 'status';
  if (e === 'tag' || e === 'tags') return 'tags';
  if (e === 'estacao' || e === 'estacoes') return 'estacoes';

  return null;
}

export const relacoesRepositorio = {
  listarPersonagensDeUmAnime(
    animeId: number,
  ): Promise<PersonagensDeUmAnimeRow[]> {
    return db
      .select()
      .from(personagens)
      .innerJoin(
        anime_personagem,
        eq(personagens.id, anime_personagem.personagem_id),
      )
      .where(eq(anime_personagem.anime_id, animeId));
  },

  listarGenerosDeUmAnime(animeId: number): Promise<GenerosDeUmAnimeRow[]> {
    return db
      .select()
      .from(generos)
      .innerJoin(anime_genero, eq(generos.id, anime_genero.genero_id))
      .where(eq(anime_genero.anime_id, animeId))
      .execute();
  },

  buscarEstudioDeUmAnime(animeId: number): Promise<EstudiosDeUmAnimeRow[]> {
    return db
      .select()
      .from(estudios)
      .innerJoin(anime_estudio, eq(estudios.id, anime_estudio.estudio_id))
      .where(eq(anime_estudio.anime_id, animeId));
  },

  listarPlataformasDeUmAnime(
    animeId: number,
  ): Promise<PlataformasDeUmAnimeRow[]> {
    return db
      .select()
      .from(plataformas)
      .innerJoin(
        anime_plataforma,
        eq(plataformas.id, anime_plataforma.plataforma_id),
      )
      .where(eq(anime_plataforma.anime_id, animeId));
  },

  buscarStatusDeUmAnime(animeId: number): Promise<StatusDeUmAnimeRow[]> {
    return db
      .select()
      .from(status)
      .innerJoin(anime_status, eq(status.id, anime_status.status_id))
      .where(eq(anime_status.anime_id, animeId));
  },

  listarTagsDeUmAnime(animeId: number): Promise<TagsDeUmAnimeRow[]> {
    return db
      .select()
      .from(tags)
      .innerJoin(anime_tag, eq(tags.id, anime_tag.tag_id))
      .where(eq(anime_tag.anime_id, animeId));
  },

  listarAnimesDeUmPersonagem(
    personagemId: number,
  ): Promise<AnimesDeUmPersonagemRow[]> {
    return db
      .select({ animes: animes, anime_personagem })
      .from(animes)
      .innerJoin(anime_personagem, eq(animes.id, anime_personagem.anime_id))
      .where(eq(anime_personagem.personagem_id, personagemId))
      .execute();
  },

  listarAnimesDeUmGenero(generoId: number): Promise<AnimesDeUmGeneroRow[]> {
    return db
      .select({
        animes: animes,
        anime_genero: anime_genero,
      })
      .from(animes)
      .innerJoin(anime_genero, eq(animes.id, anime_genero.anime_id))
      .where(eq(anime_genero.genero_id, generoId))
      .execute();
  },

  listarAnimesDeUmEstudio(estudioId: number): Promise<AnimesDeUmEstudioRow[]> {
    return db
      .select({
        animes: animes,
        anime_estudio: anime_estudio,
      })
      .from(animes)
      .innerJoin(anime_estudio, eq(animes.id, anime_estudio.anime_id))
      .where(eq(anime_estudio.estudio_id, estudioId))
      .execute();
  },

  listarAnimesDeUmaPlataforma(
    plataformaId: number,
  ): Promise<AnimesDeUmaPlataformaRow[]> {
    return db
      .select({
        animes: animes,
        anime_plataforma: anime_plataforma,
      })
      .from(animes)
      .innerJoin(anime_plataforma, eq(animes.id, anime_plataforma.anime_id))
      .where(eq(anime_plataforma.plataforma_id, plataformaId))
      .execute();
  },

  listarAnimesDeUmStatus(statusId: number): Promise<AnimesDeUmStatusRow[]> {
    return db
      .select({
        animes: animes,
        anime_status: anime_status,
      })
      .from(animes)
      .innerJoin(anime_status, eq(animes.id, anime_status.anime_id))
      .where(eq(anime_status.status_id, statusId))
      .execute();
  },

  listarAnimesDeUmaTag(tagId: number): Promise<AnimesDeUmaTagRow[]> {
    return db
      .select({
        animes: animes,
        anime_tag: anime_tag,
      })
      .from(animes)
      .innerJoin(anime_tag, eq(animes.id, anime_tag.anime_id))
      .where(eq(anime_tag.tag_id, tagId))
      .execute();
  },

  buscarAnimesPorTitulo(titulo: string): Promise<Anime[]> {
    return db
      .select()
      .from(animes)
      .where(ilike(animes.titulo, `%${titulo}%`));
  },

  buscarPersonagensPorNome(nome: string): Promise<Personagem[]> {
    return db
      .select()
      .from(personagens)
      .where(ilike(personagens.nome, `%${nome}%`));
  },

  buscarGenerosPorNome(nome: string): Promise<Genero[]> {
    return db
      .select()
      .from(generos)
      .where(ilike(generos.nome, `%${nome}%`));
  },

  buscarEstudiosPorNome(nome: string): Promise<Estudio[]> {
    return db
      .select()
      .from(estudios)
      .where(ilike(estudios.nome, `%${nome}%`));
  },

  buscarPlataformasPorNome(nome: string): Promise<Plataforma[]> {
    return db
      .select()
      .from(plataformas)
      .where(ilike(plataformas.nome, `%${nome}%`));
  },

  buscarTagsPorNome(nome?: string): Promise<Tag[]> {
    if (!nome) {
      return db.select().from(tags);
    }
    return db
      .select()
      .from(tags)
      .where(ilike(tags.nome, `%${nome}%`));
  },

  listarAnimesDeUmaEstacao(
    estacaoId: number,
  ): Promise<AnimesDeUmaEstacaoRow[]> {
    return db
      .select()
      .from(animes)
      .where(eq(animes.estacao_id, estacaoId))
      .then((rows) =>
        rows
          .filter((row) => row.estacao_id !== null)
          .map((row) => ({
            ...row,
            estacao_id: row.estacao_id as number,
          })) as AnimesDeUmaEstacaoRow[]
      );
  },

  buscarEstacoesPorNome(nome: string): Promise<Estacao[]> {
    return db
      .select()
      .from(estacoes)
      .where(ilike(estacoes.nome, `%${nome}%`));
  },

  buscarStatusPorNome(nome: string): Promise<Status[]> {
    return db
      .select()
      .from(status)
      .where(ilike(status.nome, `%${nome}%`));
  },

  buscarEntidadesDeUmAnime(
    animeId: number,
    entidade: EntidadeCanonica | string,
  ): Promise<EntidadesDoAnimeMap[keyof EntidadesDoAnimeMap]> | null {
    const canon = canonizarEntidade(entidade);
    if (!canon) return null;

    const map: Record<
      keyof EntidadesDoAnimeMap,
      () => Promise<EntidadesDoAnimeMap[keyof EntidadesDoAnimeMap]>
    > = {
      personagens: () => this.listarPersonagensDeUmAnime(animeId),
      generos: () => this.listarGenerosDeUmAnime(animeId),
      estudios: () => this.buscarEstudioDeUmAnime(animeId),
      plataformas: () => this.listarPlataformasDeUmAnime(animeId),
      status: () => this.buscarStatusDeUmAnime(animeId),
      tags: () => this.listarTagsDeUmAnime(animeId),
      estacoes: async () => {
        const anime: Anime[] = await db
          .select()
          .from(animes)
          .where(eq(animes.id, animeId))
          .limit(1);
        if (!anime.length || typeof anime[0].estacao_id !== 'number') return [];
        const estacao = await db
          .select()
          .from(estacoes)
          .where(eq(estacoes.id, anime[0].estacao_id));
        return estacao;
      },
    };

    return map[canon as keyof EntidadesDoAnimeMap]();
  },

  async buscarEstacaoDeUmAnime(animeId: number): Promise<Estacao[] | null> {
    const anime: Anime[] = await db
      .select()
      .from(animes)
      .where(eq(animes.id, animeId))
      .limit(1);
    if (!anime.length || typeof anime[0].estacao_id !== 'number') return null;
    const estacao = await db
      .select()
      .from(estacoes)
      .where(eq(estacoes.id, anime[0].estacao_id));
    return estacao.length ? estacao : null;
  },

  buscarAnimesDeUmaEntidade(
    entidadeId: number,
    entidade: EntidadeCanonica | string,
  ): Promise<AnimesDaEntidadeMap[EntidadeCanonica]> | null {
    const canon = canonizarEntidade(entidade);
    if (!canon) return null;

    const map: Record<
      EntidadeCanonica,
      () => Promise<AnimesDaEntidadeMap[EntidadeCanonica]>
    > = {
      personagens: () => this.listarAnimesDeUmPersonagem(entidadeId),
      generos: () => this.listarAnimesDeUmGenero(entidadeId),
      estudios: () => this.listarAnimesDeUmEstudio(entidadeId),
      plataformas: () => this.listarAnimesDeUmaPlataforma(entidadeId),
      status: () => this.listarAnimesDeUmStatus(entidadeId),
      tags: () => this.listarAnimesDeUmaTag(entidadeId),
      estacoes: () => this.listarAnimesDeUmaTag(entidadeId),
    };

    return map[canon]();
  },
};
