import { prisma } from '../config/prisma';
import type { Temporada as TemporadaModel } from '../../generated/prisma/client';

export class TemporadaService {
    async listTemporadas(): Promise<TemporadaModel[]> {
        return prisma.temporada.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    async listTemporadasByAnimeId(
        animeId: number
    ): Promise<TemporadaModel[]> {
        return prisma.temporada.findMany({
            where: {
                episodios: {
                    some: {
                        animeId,
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    async getTemporadaById(
        id: number
    ): Promise<TemporadaModel | null> {
        return prisma.temporada.findUnique({
            where: {
                id,
            },
        });
    }

    async existsTemporadaForAnime(
        temporadaId: number,
        animeId: number
    ): Promise<boolean> {
        const temporada = await prisma.temporada.findFirst({
            where: {
                id: temporadaId,
                episodios: {
                    some: {
                        animeId,
                    },
                },
            },
            select: {
                id: true,
            },
        });

        return temporada !== null;
    }

    async findTemporadaByAnimeAndSeasonNumber(
        animeId: number,
        seasonNumber: number
    ): Promise<TemporadaModel | null> {
        const pattern = `${seasonNumber}ª`;

        return prisma.temporada.findFirst({
            where: {
                nome: {
                    contains: pattern,
                },
                episodios: {
                    some: {
                        animeId,
                    },
                },
            },
        });
    }
}

export const temporadaService =
    new TemporadaService();
