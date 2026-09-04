import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma';
import { animeService } from '../services/animeService';
import type { AnimeData } from '../services/animeService';
import { batchBodySchema } from '../schemas/batch/batch.schemas';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';

const BatchRouter = Router();

// schemas moved to backend/src/schemas/batch/batch.schemas.ts

BatchRouter.post(
    '/animes/batch',
    authMiddleware,
    adminMiddleware,
    validationMiddleware({ body: batchBodySchema }),
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
                            titulo: true,
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