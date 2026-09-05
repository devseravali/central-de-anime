import { Router } from 'express';

import { animeController } from '../controllers/animeController';
import { temporadaController } from '../controllers/temporadaController';
import { personagemController } from '../controllers/personagemController';
import { episodioController } from '../controllers/episodioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { prisma } from '../config/prisma';

const AnimesRouter = Router();

/**
 * @swagger
 * /animes:
 *   get:
 *     summary: Lista todos os animes
 *     tags:
 *       - Animes
 *     responses:
 *       200:
 *         description: Lista de animes retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/',
    animeController.list
);

/**
 * @swagger
 * /animes/search:
 *   get:
 *     summary: Pesquisa animes
 *     tags:
 *       - Animes
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         description: Termo utilizado para pesquisar animes
 *         schema:
 *           type: string
 *           example: Naruto
 *     responses:
 *       200:
 *         description: Resultado da pesquisa
 *       400:
 *         description: Parâmetros de pesquisa inválidos
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/search',
    animeController.search
);

/**
 * @swagger
 * /animes:
 *   post:
 *     summary: Cria um anime
 *     description: Cria um novo anime. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Animes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Anime criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.post(
    '/',
    authMiddleware,
    adminMiddleware,
    animeController.create
);

/**
 * @swagger
 * /animes/capa:
 *   post:
 *     summary: Cadastra ou atualiza a capa de um anime
 *     description: Cadastra uma capa e associa o caminho da capa ao anime. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Animes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animeId
 *               - nome_original
 *               - nome_salvo
 *               - caminho
 *               - mime_type
 *             properties:
 *               animeId:
 *                 type: integer
 *                 example: 1
 *               nome_original:
 *                 type: string
 *                 example: naruto.jpg
 *               nome_salvo:
 *                 type: string
 *                 example: anime-1-capa.jpg
 *               caminho:
 *                 type: string
 *                 example: /uploads/capas/anime-1-capa.jpg
 *               mime_type:
 *                 type: string
 *                 example: image/jpeg
 *     responses:
 *       201:
 *         description: Capa cadastrada com sucesso
 *       400:
 *         description: Dados inválidos ou ID de anime inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro ao criar capa
 */
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

            let capa;

            const existingCapa = await prisma.capas.findUnique({
                where: {
                    caminho,
                },
            });

            if (existingCapa) {
                capa = await prisma.capas.update({
                    where: { id: existingCapa.id },
                    data: {
                        nome_original,
                        nome_salvo,
                        mime_type,
                    },
                });
            } else {
                try {
                    const rows: any = await prisma.$queryRaw`
                        INSERT INTO "Capas" ("nome_original", "nome_salvo", "caminho", "mime_type")
                        VALUES (${nome_original}, ${nome_salvo}, ${caminho}, ${mime_type})
                        ON CONFLICT (caminho) DO UPDATE
                        SET nome_original = EXCLUDED.nome_original,
                            nome_salvo = EXCLUDED.nome_salvo,
                            mime_type = EXCLUDED.mime_type
                        RETURNING id, nome_original, nome_salvo, caminho, mime_type
                    `;

                    capa = Array.isArray(rows) ? rows[0] : rows;
                } catch (err: any) {
                    console.error('Erro no upsert raw de capa:', err);
                    throw err;
                }
            }

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

/**
 * @swagger
 * /animes/{id}:
 *   get:
 *     summary: Busca um anime pelo ID
 *     tags:
 *       - Animes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Anime encontrado com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/:id',
    animeController.getById
);

/**
 * @swagger
 * /animes/{id}/temporadas:
 *   get:
 *     summary: Lista as temporadas de um anime
 *     tags:
 *       - Temporadas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de temporadas retornada com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/:id/temporadas',
    (req, res) => {
        const requestWithAnimeId = Object.create(req);

        Object.defineProperty(
            requestWithAnimeId,
            'query',
            {
                value: {
                    ...req.query,
                    animeId: req.params.id,
                },
                configurable: true,
                enumerable: true,
                writable: true,
            }
        );

        return temporadaController.list(requestWithAnimeId, res);
    }
);

/**
 * @swagger
 * /animes/{id}/temporadas/numero/{seasonNumber}/episodios:
 *   get:
 *     summary: Lista os episódios de uma temporada pelo número
 *     tags:
 *       - Episódios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: seasonNumber
 *         required: true
 *         description: Número da temporada
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de episódios retornada com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Anime ou temporada não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/:id/temporadas/numero/:seasonNumber/episodios',
    episodioController.listByAnimeAndSeasonNumber
);

/**
 * @swagger
 * /animes/{id}/personagens:
 *   get:
 *     summary: Lista os personagens de um anime
 *     tags:
 *       - Personagens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de personagens retornada com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/:id/personagens',
    personagemController.listByAnimeId
);

/**
 * @swagger
 * /animes/{id}/temporadas/{temporadaId}/episodios:
 *   get:
 *     summary: Lista os episódios de uma temporada
 *     tags:
 *       - Episódios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: temporadaId
 *         required: true
 *         description: ID da temporada
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de episódios retornada com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Anime ou temporada não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.get(
    '/:id/temporadas/:temporadaId/episodios',
    (req, res) => {
        const requestWithTemporadaId = Object.create(req);

        Object.defineProperty(
            requestWithTemporadaId,
            'query',
            {
                value: {
                    ...req.query,
                    temporadaId: req.params.temporadaId,
                },
                configurable: true,
                enumerable: true,
                writable: true,
            }
        );

        return episodioController.list(
            requestWithTemporadaId,
            res
        );
    }
);

/**
 * @swagger
 * /animes/{id}/capas:
 *   get:
 *     summary: Lista as capas de um anime
 *     tags:
 *       - Animes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de capas do anime
 *       400:
 *         description: ID de anime inválido
 *       500:
 *         description: Erro ao buscar capas
 */
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

/**
 * @swagger
 * /animes/{id}:
 *   put:
 *     summary: Atualiza um anime
 *     description: Atualiza os dados de um anime. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Animes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Anime atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    animeController.update
);

/**
 * @swagger
 * /animes/{id}:
 *   delete:
 *     summary: Remove um anime
 *     description: Remove um anime. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Animes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do anime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Anime removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AnimesRouter.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    animeController.remove
);

export default AnimesRouter;