import { AnimeType } from "./AnimeType";

export type FranquiaType = {
    id: number;
    nome: string;
    descricao: string;
    animes: AnimeType[];
};