import { AnimeType } from "./AnimeType";

export type EstacaoType = {
    id: number;
    nome: string;
    animes: AnimeType[];
};