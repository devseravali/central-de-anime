import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma';
import { animeService } from '../services/animeService';
import type { AnimeData } from '../services/animeService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';

const BatchRouter = Router();

const animeSchema = z.object({
    id: z.union([
        z.number(),
        z.string(),
    ]).optional(),

    titulo: z
        .string()
        .trim()
        .min(1, 'Título é obrigatório'),

    sinopse: z.string().optional(),

    tipo: z.string().optional(),

    temporada: z.number().optional(),

    ano: z.number().optional(),

    anoLancamento: z.number().optional(),

    quantidadeEpisodios: z.union([
        z.number(),
        z.string(),
    ]).optional(),

    capaUrl: z.string().url().optional(),

    franquiaId: z.union([
        z.number(),
        z.string(),
    ]).optional(),

    estudioId: z.union([
        z.number(),
        z.string(),
    ]).optional(),

    statusId: z.union([
        z.number(),
        z.string(),
    ]).optional(),

    status: z.union([
        z.string(),
        z.number(),
    ]).optional(),

    genero: z.union([
        z.string(),
        z.number(),
    ]).optional(),

    generos: z
        .array(
            z.union([
                z.string(),
                z.number(),
            ])
        )
        .optional(),
});

const idsSchema = z.object({
    ids: z
        .array(z.number().int().positive())
        .min(1, 'Informe pelo menos um ID'),
});

const batchSchema = z.object({
    body: z.union([
        z.array(animeSchema).min(
            1,
            'Informe pelo menos um anime'
        ),
        animeSchema,
        idsSchema,
    ]),
    params: z.object({}),
    query: z.object({}),
});

BatchRouter.post(
    '/animes/batch',
    authMiddleware,
    adminMiddleware,
    validationMiddleware(batchSchema),
    async (req: Request, res: Response) => {
        try {
            const body = req.body as
                | AnimeData[]
                | AnimeData
                | { ids: number[] };

            if (
                body &&
                typeof body === 'object' &&
                !Array.isArray(body) &&
                'ids' in body
            ) {
                const animes =
                    await prisma.anime.findMany({
                        where: {
                            id: {
                                in: body.ids,
                            },
                        },
                        select: {
                            id: true,
                            nome: true,
                            slug: true,
                        },
                    });

                res.status(200).json({
                    animesFound: animes.length,
                    animes,
                });

                return;
            }

            const payload: AnimeData[] =
                Array.isArray(body)
                    ? body
                    : [body];

            if (
                typeof animeService.batchUpsertAnimes !==
                'function'
            ) {
                res.status(500).json({
                    message:
                        'Serviço de batch não disponível',
                });

                return;
            }

            const result =
                await animeService.batchUpsertAnimes(
                    payload
                );

            res.status(200).json(result);
        } catch (error) {
            console.error(
                'Erro no batch de animes',
                error
            );

            res.status(500).json({
                message: 'Erro no batch',
            });
        }
    }
);

export default BatchRouter;