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
}

export const temporadaService =
    new TemporadaService();
