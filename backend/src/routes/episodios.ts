import { Router } from 'express';

import { episodioController } from '../controllers/episodioController';

const EpisodiosRouter = Router();

/**
 * @swagger
 * /episodios/animes/{id}/episodios:
 *   get:
 *     summary: Lista episódios por anime
 *     description: Retorna a lista de episódios de um anime pelo ID.
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
 *     responses:
 *       200:
 *         description: Episódios retornados com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
EpisodiosRouter.get(
    '/animes/:id/episodios',
    episodioController.list
);

/**
 * @swagger
 * /episodios/animes/{id}/temporadas/{seasonNumber}/episodios:
 *   get:
 *     summary: Lista episódios por anime e temporada
 *     description: Retorna a lista de episódios de um anime filtrada pelo número da temporada.
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
 *         description: Episódios da temporada retornados com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Anime ou temporada não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
EpisodiosRouter.get(
    '/animes/:id/temporadas/:seasonNumber/episodios',
    episodioController.listByAnimeAndSeasonNumber
);

/**
 * @swagger
 * /episodios:
 *   get:
 *     summary: Lista todos os episódios
 *     description: Retorna uma lista de episódios.
 *     tags:
 *       - Episódios
 *     responses:
 *       200:
 *         description: Lista de episódios retornada com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
EpisodiosRouter.get(
    '/',
    episodioController.list
);

/**
 * @swagger
 * /episodios/{id}:
 *   get:
 *     summary: Busca um episódio pelo ID
 *     description: Retorna os dados de um episódio específico.
 *     tags:
 *       - Episódios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do episódio
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Episódio encontrado com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Episódio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
EpisodiosRouter.get(
    '/:id',
    episodioController.getById
);

export default EpisodiosRouter;