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
        temporadaId: number
    ): Promise<EpisodioModel[]> {
        return prisma.episodio.findMany({
            where: {
                temporadaId,
            },
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