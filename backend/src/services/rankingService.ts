import { prisma } from '../config/prisma';
import type { RankingUsuarioModel } from '../../generated/prisma/models/RankingUsuario';

const PONTOS_POR_EPISODIO = 10;

export class RankingService {
    async getRankingByUsuarioId(
        usuarioId: number
    ): Promise<RankingUsuarioModel | null> {
        return prisma.rankingUsuario.findUnique({
            where: {
                usuarioId,
            },
        });
    }

    async calcularPontos(
        usuarioId: number
    ): Promise<number> {
        const totalEpisodiosAssistidos =
            await prisma.watchProgress.count({
                where: {
                    usuarioId,
                    assistido: true,
                },
            });

        return (
            totalEpisodiosAssistidos *
            PONTOS_POR_EPISODIO
        );
    }

    async atualizarRanking(
        usuarioId: number
    ): Promise<RankingUsuarioModel> {
        const totalEpisodiosAssistidos =
            await prisma.watchProgress.count({
                where: {
                    usuarioId,
                    assistido: true,
                },
            });

        const pontos =
            totalEpisodiosAssistidos *
            PONTOS_POR_EPISODIO;

        const nivel =
            Math.floor(pontos / 100) + 1;

        return prisma.rankingUsuario.upsert({
            where: {
                usuarioId,
            },
            update: {
                pontos,
                nivel,
                totalEpisodiosAssistidos,
            },
            create: {
                usuarioId,
                pontos,
                nivel,
                totalEpisodiosAssistidos,
            },
        });
    }

    async recalcularRanking(
        usuarioId: number
    ): Promise<RankingUsuarioModel> {
        return this.atualizarRanking(
            usuarioId
        );
    }
}

export const rankingService =
    new RankingService();