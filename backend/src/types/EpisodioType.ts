export type EpisodioType = {
    id: number;
    numero: number;
    titulo: string;
    sinopse?: string | null;
    imagemUrl?: string | null;
    dataExibicao?: string | null;
    temporadaId: number;
    animeId: number;
    watchProgress?: number[];
};
