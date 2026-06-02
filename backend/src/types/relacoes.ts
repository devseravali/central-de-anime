import {
  AnimeModel,
  PersonagemModel,
  GeneroModel,
  EstudioModel,
  PlataformaModel,
  StatusModel,
  EstacaoModel,
  AnimePersonagemModel,
  AnimeGeneroModel,
  AnimeEstudioModel,
  AnimePlataformaModel,
  AnimeStatusModel,
  AnimeTagModel,
  AnimeEstacaoModel,
} from '../../generated/prisma/models';

export type Temporada = number;

export type TemporadasDeUmAnimeRow = {
  temporada: Temporada;
  anime_id: number;
};

export type AnimesDeUmaTemporadaRow = {
  animes: Anime;
  temporada: Temporada;
};

export type Anime = AnimeModel;
export type Personagem = PersonagemModel;
export type Genero = GeneroModel;
export type Estudio = EstudioModel;
export type Plataforma = PlataformaModel;
export type Status = StatusModel;
export type Tag = AnimeTagModel;
export type Estacao = EstacaoModel;

export type AnimePersonagem = AnimePersonagemModel;
export type AnimeGenero = AnimeGeneroModel;
export type AnimeEstudio = AnimeEstudioModel;
export type AnimePlataforma = AnimePlataformaModel;
export type AnimeStatus = AnimeStatusModel;
export type AnimeTag = AnimeTagModel;
export type AnimeEstacao = AnimeEstacaoModel;

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

export type EntidadesDoAnimeMap = {
  personagens: PersonagensDeUmAnimeRow[];
  generos: GenerosDeUmAnimeRow[];
  estudios: EstudiosDeUmAnimeRow[];
  plataformas: PlataformasDeUmAnimeRow[];
  status: StatusDeUmAnimeRow[];
  tags: TagsDeUmAnimeRow[];
  estacoes: Estacao[];
  temporadas?: TemporadasDeUmAnimeRow[];
};

export type AnimesDaEntidadeMap = {
  personagens: AnimesDeUmPersonagemRow[];
  generos: AnimesDeUmGeneroRow[];
  estudios: AnimesDeUmEstudioRow[];
  plataformas: AnimesDeUmaPlataformaRow[];
  status: AnimesDeUmStatusRow[];
  tags: AnimesDeUmaTagRow[];
  estacoes: AnimesDeUmaEstacaoRow[];
  temporadas?: AnimesDeUmaTemporadaRow[];
};
