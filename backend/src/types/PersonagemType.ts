import { AnimePersonagem, PersonagemFavorito } from "../../generated/prisma/client";

export type PersonagemType = {
    id: number;
    nome: string;
    imagem: string;
    sobre: string;
    idade_inicial?: string;
    sexo?: string;
    papel?: string; 
    aniversario?: string;
    altura_inicial?: string;
    afiliacao?: string;

    animes: AnimePersonagem[];
    favoritos: PersonagemFavorito[];
} 
