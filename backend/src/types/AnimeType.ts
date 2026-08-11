export type AnimeType = {
    id: number;
    titulo: string;
    tipo: string;
    temporada: number;
    ano: number;
    sinopse: string;
    capaUrl?: string;
    quantidadeEpisodios: number;
    franquiaId?: number;
    estudioId: number;
    statusId: number;
    episodios: number[];
    tags: number[];
    personagens: number[];
    favoritosUsuarios: number[];
    notasUsuarios: number[];
    cache?: number;
};