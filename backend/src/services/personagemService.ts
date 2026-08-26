import { prisma } from '../config/prisma';

export class PersonagemService {
    async listPersonagens() {
        return prisma.personagem.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    async listPersonagensByAnimeId(
        animeId: number
    ) {
        return prisma.personagem.findMany({
            where: {
                animes: {
                    some: {
                        animeId: animeId,
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    async getPersonagemById(id: number) {
        return prisma.personagem.findUnique({
            where: { id },
        });
    }
}

export const personagemService =
    new PersonagemService();