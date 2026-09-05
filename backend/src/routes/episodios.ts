import { Router } from 'express';

import { episodioController } from '../controllers/episodioController';

const EpisodiosRouter = Router();

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