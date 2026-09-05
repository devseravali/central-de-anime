import { Router, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import { animeService } from '../services/animeService';
import type { AnimeData } from '../services/animeService';

import { batchBodySchema } from '../schemas/batch/batch.schemas';

import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';

const BatchRouter = Router();

/**
 * @swagger
 * /animes/batch:
 *   post:
 *     summary: Processa animes em lote
 *     description: |
 *       Permite consultar animes por uma lista de IDs ou realizar
 *       inserção/atualização de animes em lote.
 *       Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Animes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - ids
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example:
 *                       - 1
 *                       - 2
 *                       - 3
 *               - type: object
 *                 description: Dados de um anime para criação ou atualização
 *               - type: array
 *                 description: Lista de animes para criação ou atualização em lote
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Operação em lote realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     animesFound:
 *                       type: integer
 *                       example: 3
 *                     animes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           titulo:
 *                             type: string
 *                             example: Naruto
 *                 - type: object
 *                   description: Resultado da operação de batch upsert
 *       400:
 *         description: Dados enviados são inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       500:
 *         description: Erro ao processar o batch
 */
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