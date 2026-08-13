import NodeCache from 'node-cache';

import { prisma } from '../config/prisma';
import type { AnimeModel } from '../../generated/prisma/models';
import { Prisma } from '../../generated/prisma/client';

export type AnimeData = {
    id?: number;

    titulo?: string;
    descricao?: string;
    sinopse?: string;

    tipo?: string;
    temporada?: number;

    ano?: number;
    anoLancamento?: number;

    quantidadeEpisodios?: number;

    capaUrl?: string;

    franquiaId?: number;
    estudioId?: number;
    statusId?: number;

    status?: string | number;

    genero?: string | number;
    generos?: Array<string | number>;
};

export interface ListOptions {
    page?: number;
    perPage?: number;
    titulo?: string;
    generoId?: number;
    statusId?: number;
}

type AnimeWithRelations = Prisma.AnimeGetPayload<{
    include: {
        estudio: true;
        franquia: true;
        status: true;
        episodios: true;
        generos: {
            include: {
                genero: true;
            };
        };
        personagens: {
            include: {
                personagem: true;
            };
        };
        plataformas: {
            include: {
                plataforma: true;
            };
        };
        tags: {
            include: {
                tag: true;
            };
        };
        cache: true;
    };
}>;

export interface IAnimeService {
    getAnimeById(
        animeId: number,
        includeRelations?: false
    ): Promise<AnimeModel | null>;

    getAnimeById(
        animeId: number,
        includeRelations: true
    ): Promise<AnimeWithRelations | null>;

    getAnimeWithCache(animeId: number): Promise<AnimeWithRelations | null>;

    listAnimes(
        opts?: ListOptions
    ): Promise<{
        items: AnimeModel[];
        total: number;
        page: number;
        perPage: number;
    }>;

    searchAnimes(
        query: string,
        limit?: number,
        page?: number
    ): Promise<{
        items: AnimeModel[];
        total: number;
        page: number;
        perPage: number;
    }>;

    updateAnime(
        animeId: number,
        data: AnimeData
    ): Promise<AnimeModel | AnimeWithRelations>;

    deleteAnime(animeId: number): Promise<void>;
}

const animeCache = new NodeCache({
    stdTTL: 60 * 5,
    checkperiod: 120,
});

function getAnimeById(animeId: number, includeRelations?: false): Promise<AnimeModel | null>;
function getAnimeById(animeId: number, includeRelations: true): Promise<AnimeWithRelations | null>;
async function getAnimeById(
    animeId: number,
    includeRelations = false
): Promise<AnimeModel | AnimeWithRelations | null> {
    if (!includeRelations) {
        return prisma.anime.findUnique({
            where: {
                id: animeId,
            },
        });
    }

    return prisma.anime.findUnique({
        where: {
            id: animeId,
        },
        include: {
            estudio: true,
            franquia: true,
            status: true,
            episodios: true,

            generos: {
                include: {
                    genero: true,
                },
            },

            personagens: {
                include: {
                    personagem: true,
                },
            },

            plataformas: {
                include: {
                    plataforma: true,
                },
            },

            tags: {
                include: {
                    tag: true,
                },
            },

            cache: true,
        },
    });
}

async function listAnimes(
    opts: ListOptions = {}
): Promise<{
    items: AnimeModel[];
    total: number;
    page: number;
    perPage: number;
}> {
    const page =
        typeof opts.page === 'number' && opts.page > 0
            ? Math.floor(opts.page)
            : 1;

    const perPage =
        typeof opts.perPage === 'number' && opts.perPage > 0
            ? Math.floor(opts.perPage)
            : 20;

    const where: Prisma.AnimeWhereInput = {};

    if (opts.titulo?.trim()) {
        where.titulo = {
            contains: opts.titulo.trim(),
            mode: 'insensitive',
        };
    }

    if (typeof opts.statusId === 'number') {
        where.statusId = opts.statusId;
    }

    if (typeof opts.generoId === 'number') {
        where.generos = {
            some: {
                generoId: opts.generoId,
            },
        };
    }

    const [items, total] = await Promise.all([
        prisma.anime.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {
                id: 'asc',
            },
        }),

        prisma.anime.count({
            where,
        }),
    ]);

    return {
        items,
        total,
        page,
        perPage,
    };
}

async function searchAnimes(
    query: string,
    limit = 20,
    page = 1
): Promise<{
    items: AnimeModel[];
    total: number;
    page: number;
    perPage: number;
}> {
    const normalizedQuery = query.trim();

    const normalizedLimit =
        limit > 0 ? Math.floor(limit) : 20;

    const normalizedPage =
        page > 0 ? Math.floor(page) : 1;

    const where: Prisma.AnimeWhereInput = {
        OR: [
            {
                titulo: {
                    contains: normalizedQuery,
                    mode: 'insensitive',
                },
            },
            {
                sinopse: {
                    contains: normalizedQuery,
                    mode: 'insensitive',
                },
            },
        ],
    };

    const [items, total] = await Promise.all([
        prisma.anime.findMany({
            where,
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
            orderBy: {
                id: 'asc',
            },
        }),

        prisma.anime.count({
            where,
        }),
    ]);

    return {
        items,
        total,
        page: normalizedPage,
        perPage: normalizedLimit,
    };
}

async function getAnimeWithCache(
    animeId: number
): Promise<AnimeWithRelations | null> {
    const cacheKey = `anime:${animeId}`;

    const cached = animeCache.get<AnimeWithRelations>(cacheKey);

    if (cached) {
        return cached;
    }

    const anime = await getAnimeById(animeId, true);

    if (!anime) {
        return null;
    }

    try {
        await prisma.cacheAnime.upsert({
            where: {
                animeId,
            },

            update: {
                viewsCount: {
                    increment: 1,
                },
            },

            create: {
                anime: {
                    connect: {
                        id: animeId,
                    },
                },
                viewsCount: 1,
            },
        });
    } catch (error) {
        console.error(
            'Erro ao atualizar viewsCount do anime:',
            error
        );
    }

    animeCache.set(cacheKey, anime);

    return anime;
}

async function updateAnime(
    animeId: number,
    data: AnimeData
): Promise<AnimeModel | AnimeWithRelations> {
    const current = await getAnimeById(animeId);

    if (!current) {
        throw new Error('Anime não encontrado');
    }

    const payload: Prisma.AnimeUncheckedUpdateInput = {};

    if (data.titulo !== undefined) {
        payload.titulo = data.titulo;
    }

    if (data.descricao !== undefined) {
        payload.sinopse = data.descricao;
    }

    if (data.sinopse !== undefined) {
        payload.sinopse = data.sinopse;
    }

    if (typeof data.anoLancamento === 'number') {
        payload.ano = data.anoLancamento;
    }

    if (typeof data.ano === 'number') {
        payload.ano = data.ano;
    }

    if (data.capaUrl !== undefined) {
        payload.capaUrl = data.capaUrl;
    }

    if (data.tipo !== undefined) {
        payload.tipo = data.tipo;
    }

    if (typeof data.temporada === 'number') {
        payload.temporada = data.temporada;
    }

    if (typeof data.quantidadeEpisodios === 'number') {
        payload.quantidadeEpisodios =
            data.quantidadeEpisodios;
    }

    if (typeof data.estudioId === 'number') {
        payload.estudioId = data.estudioId;
    }

    if (typeof data.franquiaId === 'number') {
        payload.franquiaId = data.franquiaId;
    }

    


    if (typeof data.statusId === 'number') {
        payload.statusId = data.statusId;
    } else if (data.status !== undefined) {
        if (typeof data.status === 'number') {
            payload.statusId = data.status;
        } else {
            const status = await prisma.status.findFirst({
                where: {
                    nome: data.status,
                },
            });

            if (!status) {
                throw new Error(
                    `Status '${data.status}' não encontrado`
                );
            }

            payload.statusId = status.id;
        }
    }

    const providedGeneros =
        data.generos ??
        (data.genero !== undefined
            ? [data.genero]
            : undefined);

    if (providedGeneros !== undefined) {
        const generoIds: number[] = [];

        const generoNames: string[] = [];

        for (const genero of providedGeneros) {
            if (typeof genero === 'number') {
                generoIds.push(genero);
            } else if (typeof genero === 'string') {
                generoNames.push(genero.trim());
            }
        }

        if (generoNames.length > 0) {
            const generosEncontrados =
                await prisma.genero.findMany({
                    where: {
                        nome: {
                            in: generoNames,
                        },
                    },
                });

            const generoMap = new Map(
                generosEncontrados.map((genero) => [
                    genero.nome,
                    genero.id,
                ])
            );

            for (const nome of generoNames) {
                const generoId = generoMap.get(nome);

                if (!generoId) {
                    throw new Error(
                        `Gênero '${nome}' não encontrado`
                    );
                }

                generoIds.push(generoId);
            }
        }

    
        const uniqueGeneroIds = [
            ...new Set(generoIds),
        ];

        const updated = await prisma.$transaction(
            async (tx) => {
                await tx.animeGenero.deleteMany({
                    where: {
                        animeId,
                    },
                });

                if (uniqueGeneroIds.length > 0) {
                    await tx.animeGenero.createMany({
                        data: uniqueGeneroIds.map(
                            (generoId) => ({
                                animeId,
                                generoId,
                            })
                        ),
                        skipDuplicates: true,
                    });
                }

                return tx.anime.update({
                    where: {
                        id: animeId,
                    },
                    data: payload,
                    include: {
                        estudio: true,
                        franquia: true,
                        status: true,
                        episodios: true,
                        generos: { include: { genero: true } },
                        personagens: { include: { personagem: true } },
                        plataformas: { include: { plataforma: true } },
                        tags: { include: { tag: true } },
                        cache: true,
                    },
                });
            }
        );

        animeCache.del(cacheKey(animeId));

        return updated;
    }

    const updated = await prisma.anime.update({
        where: {
            id: animeId,
        },
        data: payload,
    });

    animeCache.del(cacheKey(animeId));

    return updated;
}

async function deleteAnime(
    animeId: number
): Promise<void> {
    const current = await getAnimeById(animeId);

    if (!current) {
        throw new Error('Anime não encontrado');
    }

    await prisma.anime.delete({
        where: {
            id: animeId,
        },
    });

    animeCache.del(cacheKey(animeId));
}

function cacheKey(animeId: number): string {
    return `anime:${animeId}`;
}

export const animeService: IAnimeService = {
    getAnimeById,
    getAnimeWithCache,
    listAnimes,
    searchAnimes,
    updateAnime,
    deleteAnime,
};