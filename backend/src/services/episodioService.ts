import { prisma } from '../config/prisma';
import type { Episodio as EpisodioModel } from '../../generated/prisma/client';

export class EpisodioService {
    async listEpisodios(): Promise<EpisodioModel[]> {
        return prisma.episodio.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    async listEpisodiosByTemporadaId(
        temporadaId: number,
        animeId?: number
    ): Promise<EpisodioModel[]> {
        const whereClause: any = { temporada: temporadaId };

        if (typeof animeId === 'number') {
            whereClause.animeId = animeId;
        }

        return prisma.episodio.findMany({
            where: whereClause,
            orderBy: {
                numero: 'asc',
            },
        });
    }

    async listEpisodiosByAnimeId(
        animeId: number
    ): Promise<EpisodioModel[]> {
        return prisma.episodio.findMany({
            where: {
                animeId,
            },
            orderBy: {
                numero: 'asc',
            },
        });
    }

    async listEpisodiosByAnimeAndSeasonNumber(
        animeId: number,
        seasonNumber: number
    ): Promise<EpisodioModel[]> {
        return prisma.episodio.findMany({
            where: {
                animeId,
                temporada: seasonNumber,
            },
            orderBy: { numero: 'asc' },
        });
    }

    async getEpisodioById(
        id: number
    ): Promise<EpisodioModel | null> {
        return prisma.episodio.findUnique({
            where: {
                id,
            },
        });
    }
}

export const episodioService =
    new EpisodioService();