import { prisma } from '../config/prisma';

export class InteracaoService {
    async favoritarAnime(
        usuarioId: number,
        animeId: number
    ): Promise<void> {
        await prisma.usuarioFavoritoAnime.upsert({
            where: {
                usuarioId_animeId: {
                    usuarioId,
                    animeId,
                },
            },
            update: {},
            create: {
                usuarioId,
                animeId,
            },
        });
    }

    async desfavoritarAnime(
        usuarioId: number,
        animeId: number
    ): Promise<void> {
        await prisma.usuarioFavoritoAnime.deleteMany({
            where: {
                usuarioId,
                animeId,
            },
        });
    }

    async favoritarPersonagem(
        usuarioId: number,
        personagemId: number
    ): Promise<void> {
        await prisma.personagemFavorito.upsert({
            where: {
                usuarioId_personagemId: {
                    usuarioId,
                    personagemId,
                },
            },
            update: {},
            create: {
                usuarioId,
                personagemId,
            },
        });
    }

    async desfavoritarPersonagem(
        usuarioId: number,
        personagemId: number
    ): Promise<void> {
        await prisma.personagemFavorito.deleteMany({
            where: {
                usuarioId,
                personagemId,
            },
        });
    }

    async darNota(
        usuarioId: number,
        animeId: number,
        nota: number
    ): Promise<void> {
        if (nota < 0 || nota > 10) {
            throw new Error(
                'A nota deve estar entre 0 e 10'
            );
        }

        await prisma.notaAnimeUsuario.upsert({
            where: {
                usuarioId_animeId: {
                    usuarioId,
                    animeId,
                },
            },
            update: {
                nota,
            },
            create: {
                usuarioId,
                animeId,
                nota,
            },
        });
    }

    async removerNota(
        usuarioId: number,
        animeId: number
    ): Promise<void> {
        await prisma.notaAnimeUsuario.deleteMany({
            where: {
                usuarioId,
                animeId,
            },
        });
    }
}

export const interacaoService =
    new InteracaoService();