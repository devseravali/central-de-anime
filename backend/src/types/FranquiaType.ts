import { AnimeType } from "./AnimeType";

export type FranquiaType = {
    id: number;
    nome: string;
    descricao?: string | null;
    anoInicio?: number | null;
    animes?: AnimeType[];
};