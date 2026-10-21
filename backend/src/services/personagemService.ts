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
            include: {
                animes: {
                    select: {
                        animeId: true,
                        anime: {
                            select: {
                                id: true,
                                titulo: true,
                                personagens: {
                                    select: {
                                        personagem: {
                                            select: {
                                                id: true,
                                                nome: true,
                                                imagem: true,
                                                papel: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        animeId: 'asc',
                    },
                },
            },
        });
    }
}

export const personagemService =
    new PersonagemService();