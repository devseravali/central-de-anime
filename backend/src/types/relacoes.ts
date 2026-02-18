import type { InferSelectModel } from 'drizzle-orm';

import { Animes } from '../schema/animes';
import { personagens } from '../schema/personagens';
import { generos } from '../schema/generos';
import { estudios } from '../schema/estudios';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { estacoes } from '../schema/estacoes';

import { anime_personagem } from '../schema/anime_personagem';
import { anime_genero } from '../schema/anime_genero';
import { anime_estudio } from '../schema/anime_estudio';
import { anime_plataforma } from '../schema/anime_plataforma';
import { anime_status } from '../schema/anime_status';
import { anime_tag } from '../schema/anime_tag';

export type Anime = InferSelectModel<typeof Animes>;
export type Personagem = InferSelectModel<typeof personagens>;
export type Genero = InferSelectModel<typeof generos>;
export type Estudio = InferSelectModel<typeof estudios>;
export type Plataforma = InferSelectModel<typeof plataformas>;
export type Status = InferSelectModel<typeof status>;
export type Tag = InferSelectModel<typeof tags>;
export type Estacao = InferSelectModel<typeof estacoes>;

export type AnimePersonagem = InferSelectModel<typeof anime_personagem>;
export type AnimeGenero = InferSelectModel<typeof anime_genero>;
export type AnimeEstudio = InferSelectModel<typeof anime_estudio>;
export type AnimePlataforma = InferSelectModel<typeof anime_plataforma>;
export type AnimeStatus = InferSelectModel<typeof anime_status>;
export type AnimeTag = InferSelectModel<typeof anime_tag>;

export type PersonagensDeUmAnimeRow = {
  personagens: Personagem;
  anime_personagem: AnimePersonagem;
};

export type AnimesDeUmPersonagemRow = {
  animes: Anime;
  anime_personagem: AnimePersonagem;
};

export type GenerosDeUmAnimeRow = {
  generos: Genero;
  anime_genero: AnimeGenero;
};

export type AnimesDeUmGeneroRow = {
  animes: Anime;
  anime_genero: AnimeGenero;
};

export type EstudiosDeUmAnimeRow = {
  estudios: Estudio;
  anime_estudio: AnimeEstudio;
};

export type AnimesDeUmEstudioRow = {
  animes: Anime;
  anime_estudio: AnimeEstudio;
};

export type PlataformasDeUmAnimeRow = {
  plataformas: Plataforma;
  anime_plataforma: AnimePlataforma;
};

export type AnimesDeUmaPlataformaRow = {
  animes: Anime;
  anime_plataforma: AnimePlataforma;
};

export type StatusDeUmAnimeRow = {
  status: Status;
  anime_status: AnimeStatus;
};

export type AnimesDeUmStatusRow = {
  animes: Anime;
  anime_status: AnimeStatus;
};

export type TagsDeUmAnimeRow = {
  tags: Tag;
  anime_tag: AnimeTag;
};

export type AnimesDeUmaTagRow = {
  animes: Anime;
  anime_tag: AnimeTag;
};

export type AnimesDeUmaEstacaoRow = {
  animes: Anime;
  estacoes: Estacao;
};

export type EntidadesDoAnime = {
  personagens: PersonagensDeUmAnimeRow[];
  generos: GenerosDeUmAnimeRow[];
  estudios: EstudiosDeUmAnimeRow[];
  plataformas: PlataformasDeUmAnimeRow[];
  status: StatusDeUmAnimeRow[];
  tags: TagsDeUmAnimeRow[];
  estacoes: Estacao[] | null;
};

export type AnimesDaEntidadeMap = {
  personagens: AnimesDeUmPersonagemRow[];
  generos: AnimesDeUmGeneroRow[];
  estudios: AnimesDeUmEstudioRow[];
  plataformas: AnimesDeUmaPlataformaRow[];
  status: AnimesDeUmStatusRow[];
  tags: AnimesDeUmaTagRow[];
  estacoes: AnimesDeUmaEstacaoRow[];
};

export type EntidadesDoAnimeMap = {
  personagens: PersonagensDeUmAnimeRow[];
  generos: GenerosDeUmAnimeRow[];
  estudios: EstudiosDeUmAnimeRow[];
  plataformas: PlataformasDeUmAnimeRow[];
  status: StatusDeUmAnimeRow[];
  tags: TagsDeUmAnimeRow[];
  estacoes: Estacao[] | null;
};
