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

AnimesRouter.post(
    '/',
    authMiddleware,
    adminMiddleware,
    animeController.create
);

AnimesRouter.post(
    '/capa',
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const {
                animeId,
                nome_original,
                nome_salvo,
                caminho,
                mime_type,
            } = req.body ?? {};

            const id = Number.parseInt(
                String(animeId ?? ''),
                10
            );

            if (Number.isNaN(id)) {
                res.status(400).json({
                    message: 'ID de anime inválido',
                });

                return;
            }

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

            const anime = await prisma.anime.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });

            if (!anime) {
                res.status(404).json({
                    message: 'Anime não encontrado',
                });

                return;
            }

            const capa = await prisma.capas.upsert({
                where: {
                    caminho,
                },
                update: {
                    nome_original,
                    nome_salvo,
                    mime_type,
                },
                create: {
                    nome_original,
                    nome_salvo,
                    caminho,
                    mime_type,
                },
            });

            await prisma.anime.update({
                where: {
                    id,
                },
                data: {
                    capaUrl: caminho,
                },
            });

            res.status(201).json({
                message: 'Capa cadastrada com sucesso',
                capa,
                animeId: id,
            });
        } catch (error) {
            console.error('Erro ao criar capa:', error);

            res.status(500).json({
                message: 'Erro ao criar capa',
            });
        }
    }
);

AnimesRouter.get(
    '/:id',
    animeController.getById
);

AnimesRouter.get(
    '/:id/temporadas',
    (req, res) => {
        req.query.animeId = req.params.id;

        return temporadaController.list(req, res);
    }
);

AnimesRouter.get(
    '/:id/temporadas/numero/:seasonNumber/episodios',
    episodioController.listByAnimeAndSeasonNumber
);

AnimesRouter.get(
    '/:id/personagens',
    personagemController.listByAnimeId
);

AnimesRouter.get(
    '/:id/temporadas/:temporadaId/episodios',
    (req, res) => {
        req.query.temporadaId = req.params.temporadaId;

        return episodioController.list(req, res);
    }
);

AnimesRouter.get(
    '/:id/capas',
    async (req, res) => {
        try {
            const animeId = Number.parseInt(
                req.params.id,
                10
            );

            if (Number.isNaN(animeId)) {
                res.status(400).json({
                    message: 'ID de anime inválido',
                });

                return;
            }

            const anime = await prisma.anime.findUnique({
                where: {
                    id: animeId,
                },
                select: {
                    capaUrl: true,
                },
            });

            if (!anime || !anime.capaUrl) {
                res.status(200).json([]);

                return;
            }

            const capas = await prisma.capas.findMany({
                where: {
                    caminho: anime.capaUrl,
                },
            });

            res.status(200).json(capas);
        } catch (error) {
            console.error(
                'Erro ao buscar capas:',
                error
            );

            res.status(500).json({
                message: 'Erro ao buscar capas',
            });
        }
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

export default AnimesRouter;