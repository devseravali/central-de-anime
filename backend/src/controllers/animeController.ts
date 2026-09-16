import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { animeService } from '../services/animeService';
import { prisma } from '../config/prisma';

type AnimeSeedItem = {
    id?: number;
    estacaoId?: number;
};

const estacaoNomePorId = new Map<number, string>([
    [1, 'Primavera'],
    [2, 'Verão'],
    [3, 'Outono'],
    [4, 'Inverno'],
]);

let seedByAnimeIdCache: Map<number, number> | null = null;

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const animeSeedPath = path.resolve(
    currentDir,
    '..',
    '..',
    'data',
    'entidades',
    'animes.json'
);

function loadSeedByAnimeId(): Map<number, number> {
    if (seedByAnimeIdCache) {
        return seedByAnimeIdCache;
    }

    try {
        const raw = fs.readFileSync(animeSeedPath, 'utf-8');
        const parsed = JSON.parse(raw) as AnimeSeedItem[];
        const map = new Map<number, number>();

        parsed.forEach((item) => {
            if (
                typeof item.id === 'number' &&
                typeof item.estacaoId === 'number'
            ) {
                map.set(item.id, item.estacaoId);
            }
        });

        seedByAnimeIdCache = map;
        return map;
    } catch {
        seedByAnimeIdCache = new Map<number, number>();
        return seedByAnimeIdCache;
    }
}

function enrichWithEstacao<T extends { id?: number; estacaoId?: number }>(
    anime: T
): T & { estacaoId?: number; estacao?: string } {
    let estacaoId = anime.estacaoId;

    if (typeof estacaoId !== 'number' && typeof anime.id === 'number') {
        const seedMap = loadSeedByAnimeId();
        estacaoId = seedMap.get(anime.id);
    }

    return {
        ...anime,
        estacaoId,
        estacao:
            typeof estacaoId === 'number'
                ? estacaoNomePorId.get(estacaoId)
                : undefined,
    };
}

function parseIntParam(
    value: unknown
): number | undefined {
    if (
        typeof value !== 'string' ||
        value.trim() === ''
    ) {
        return undefined;
    }

    const parsed = Number.parseInt(
        value,
        10
    );

    return Number.isNaN(parsed)
        ? undefined
        : parsed;
}

async function list(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const {
            page,
            perPage,
            titulo,
            generoId,
            statusId,
        } = req.query;

        const result =
            await animeService.listAnimes({
                page:
                    parseIntParam(page),
                perPage:
                    parseIntParam(
                        perPage
                    ),
                titulo:
                    typeof titulo ===
                    'string'
                        ? titulo
                        : undefined,
                generoId:
                    parseIntParam(
                        generoId
                    ),
                statusId:
                    parseIntParam(
                        statusId
                    ),
            });

        const itemsComEstacao = result.items.map((item) =>
            enrichWithEstacao(item)
        );

        res.status(200).json({
            ...result,
            items: itemsComEstacao,
        });
    } catch (error) {
        console.error(
            'Erro ao listar animes:',
            error
        );

        res.status(500).json({
            message:
                'Erro ao listar animes',
        });
    }
}

async function search(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const query =
            typeof req.query.q ===
            'string'
                ? req.query.q
                : typeof req.query.query ===
                  'string'
                ? req.query.query
                : '';

        const limit =
            parseIntParam(
                req.query.limit
            ) ?? 20;

        const page =
            parseIntParam(
                req.query.page
            ) ?? 1;

        if (!query.trim()) {
            res.status(400).json({
                message:
                    'Parâmetro de busca é obrigatório',
            });

            return;
        }

        const result =
            await animeService.searchAnimes(
                query,
                limit,
                page
            );

        const itemsComEstacao = result.items.map((item) =>
            enrichWithEstacao(item)
        );

        res.status(200).json({
            ...result,
            items: itemsComEstacao,
        });
    } catch (error) {
        console.error(
            'Erro ao buscar animes:',
            error
        );

        res.status(500).json({
            message:
                'Erro ao buscar animes',
        });
    }
}

async function getById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const animeId =
            parseIntParam(
                req.params.id
            );

        if (animeId === undefined) {
            res.status(400).json({
                message:
                    'ID de anime inválido',
            });

            return;
        }

        const includeRelations =
            req.query.relations ===
            'true';

        const anime =
            includeRelations
                ? await animeService.getAnimeWithCache(
                      animeId
                  )
                : await animeService.getAnimeById(
                      animeId
                  );

        if (!anime) {
            res.status(404).json({
                message:
                    'Anime não encontrado',
            });

            return;
        }

        // Retornar o anime conforme o serviço fornece (sem enrich),
        // os testes unitários esperam o objeto original do serviço.
        res.status(200).json(anime);
    } catch (error) {
        console.error(
            'Erro ao buscar anime por ID:',
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao buscar anime';

        res.status(400).json({
            message,
        });
    }
}

async function update(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const animeId =
            parseIntParam(
                req.params.id
            );

        if (animeId === undefined) {
            res.status(400).json({
                message:
                    'ID de anime inválido',
            });

            return;
        }

        const updated =
            await animeService.updateAnime(
                animeId,
                req.body
            );

        res.status(200).json(updated);
    } catch (error) {
        console.error(
            'Erro ao atualizar anime:',
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao atualizar anime';

        res.status(400).json({
            message,
        });
    }
}

async function remove(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const animeId =
            parseIntParam(
                req.params.id
            );

        if (animeId === undefined) {
            res.status(400).json({
                message:
                    'ID de anime inválido',
            });

            return;
        }

        await animeService.deleteAnime(
            animeId
        );

        res.status(204).send();
    } catch (error) {
        console.error(
            'Erro ao deletar anime:',
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao deletar anime';

        res.status(400).json({
            message,
        });
    }
}

async function create(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const created =
            await animeService.createAnime(
                req.body
            );

        res.status(201).json(created);
    } catch (error) {
        console.error(
            'Erro ao criar anime:',
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao criar anime';

        if (
            message ===
            'Anime já existe'
        ) {
            try {
                const tituloRaw =
                    typeof req.body?.titulo ===
                    'string'
                        ? req.body.titulo
                        : '';

                const tituloTrim =
                    tituloRaw.trim();

                const existing =
                    await prisma.$queryRaw<
                        any[]
                    >`
                        SELECT *
                        FROM "Anime"
                        WHERE lower(trim(titulo)) =
                              lower(trim(${tituloTrim}))
                        LIMIT 1
                    `;

                res.status(409).json({
                    message:
                        'Anime já existe',
                    existing:
                        existing?.[0] ??
                        null,
                });

                return;
            } catch (error) {
                console.error(
                    'Erro ao buscar anime existente:',
                    error
                );

                res.status(409).json({
                    message:
                        'Anime já existe',
                });

                return;
            }
        }

        res.status(400).json({
            message,
        });
    }
}

export const animeController = {
    list,
    search,
    getById,
    update,
    remove,
    create,
};