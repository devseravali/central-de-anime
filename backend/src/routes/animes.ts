import { Router } from 'express';

import { animeController } from '../controllers/animeController';
import { temporadaController } from '../controllers/temporadaController';
import { personagemController } from '../controllers/personagemController';
import { episodioController } from '../controllers/episodioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { prisma } from '../config/prisma';

const AnimesRouter = Router();

AnimesRouter.get(
    '/',
    animeController.list
);

AnimesRouter.get(
    '/search',
    animeController.search
);

AnimesRouter.get(
    '/:id',
    animeController.getById
);

AnimesRouter.post(
    '/',
    authMiddleware,
    adminMiddleware,
    animeController.create
);

AnimesRouter.get(
    '/:id/temporadas',
    (req, res) => {
        req.query.animeId =
            req.params.id;

        return temporadaController.list(
            req,
            res
        );
    }
);

AnimesRouter.get(
    '/:id/personagens',
    (req, res) => {
        req.query.animeId =
            req.params.id;

        return personagemController.list(
            req,
            res
        );
    }
);

AnimesRouter.get(
    '/:id/temporadas/:temporadaId/episodios',
    (req, res) => {
        req.query.temporadaId =
            req.params.temporadaId;

        return episodioController.list(
            req,
            res
        );
    }
);

AnimesRouter.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    animeController.update
);

AnimesRouter.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    animeController.remove
);

AnimesRouter.get(
    '/:id/capas',
    async (req, res) => {
        try {
            const capas =
                await prisma.capas.findMany();

            res.status(200).json(capas);
        } catch (error) {
            console.error(
                'Erro ao buscar capas:',
                error
            );

            res.status(500).json({
                message:
                    'Erro ao buscar capas',
            });
        }
    }
);

AnimesRouter.post(
    '/:id/capa',
    async (req, res) => {
        try {
            const animeId =
                Number.parseInt(
                    req.params.id,
                    10
                );

            if (Number.isNaN(animeId)) {
                res.status(400).json({
                    message:
                        'ID de anime inválido',
                });

                return;
            }

            const {
                nome_original,
                nome_salvo,
                caminho,
                mime_type,
            } = req.body ?? {};

            if (
                !nome_original ||
                !nome_salvo ||
                !caminho ||
                !mime_type
            ) {
                res.status(400).json({
                    message:
                        'nome_original, nome_salvo, caminho e mime_type são obrigatórios',
                });

                return;
            }

            const capa =
                await prisma.capas.create({
                    data: {
                        nome_original,
                        nome_salvo,
                        caminho,
                        mime_type,
                    },
                });

            res.status(201).json({
                capa,
                animeId,
            });
        } catch (error) {
            console.error(
                'Erro ao criar capa:',
                error
            );

            res.status(500).json({
                message:
                    'Erro ao criar capa',
            });
        }
    }
);

export default AnimesRouter;