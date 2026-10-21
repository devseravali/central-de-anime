import { prisma } from '../config/prisma';

export type RankingAnimeItem = {
    id: number;
    titulo: string;
    capaUrl: string | null;
    tipo: string;
    ano: number;
    totalFavoritos: number;
};

export type RankingPersonagemItem = {
    id: number;
    nome: string;
    imagem: string;
    papel: string | null;
    afiliacao: string | null;
    totalFavoritos: number;
};

export class RankingService {
    async getTopAnimes(limit = 10): Promise<RankingAnimeItem[]> {
        const animes = await prisma.anime.findMany({
            select: {
                id: true,
                titulo: true,
                capaUrl: true,
                tipo: true,
                ano: true,
                _count: {
                    select: {
                        favoritosUsuarios: true,
                    },
                },
            },
            orderBy: [
                {
                    favoritosUsuarios: {
                        _count: 'desc',
                    },
                },
                { titulo: 'asc' },
            ],
            take: limit,
        });

        return animes.map((anime) => ({
            id: anime.id,
            titulo: anime.titulo,
            capaUrl: anime.capaUrl,
            tipo: anime.tipo,
            ano: anime.ano,
            totalFavoritos: anime._count.favoritosUsuarios,
        }));
    }

    async getTopPersonagens(limit = 10): Promise<RankingPersonagemItem[]> {
        const personagens = await prisma.personagem.findMany({
            select: {
                id: true,
                nome: true,
                imagem: true,
                papel: true,
                afiliacao: true,
                _count: {
                    select: {
                        favoritos: true,
                    },
                },
            },
            orderBy: [
                {
                    favoritos: {
                        _count: 'desc',
                    },
                },
                { nome: 'asc' },
            ],
            take: limit,
        });

        return personagens.map((personagem) => ({
            id: personagem.id,
            nome: personagem.nome,
            imagem: personagem.imagem,
            papel: personagem.papel,
            afiliacao: personagem.afiliacao,
            totalFavoritos: personagem._count.favoritos,
        }));
    }
}

export const rankingService = new RankingService();
