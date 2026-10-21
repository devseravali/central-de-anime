import { Router } from 'express';

import { rankingController } from '../controllers/rankingController';

const RankingRouter = Router();

/**
 * @swagger
 * /ranking/animes/top:
 *   get:
 *     summary: Lista os animes mais favoritados
 *     description: Retorna os animes com maior quantidade de favoritos.
 *     tags:
 *       - Ranking
 *     responses:
 *       200:
 *         description: Ranking de animes retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   titulo:
 *                     type: string
 *                     example: Naruto
 *                   capaUrl:
 *                     type: string
 *                     nullable: true
 *                     example: /images/capas/naruto.jpg
 *                   tipo:
 *                     type: string
 *                     example: TV
 *                   ano:
 *                     type: integer
 *                     example: 2002
 *                   totalFavoritos:
 *                     type: integer
 *                     example: 42
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.get(
  '/ranking/animes/top',
  rankingController.getTopAnimes
);

/**
 * @swagger
 * /ranking/personagens/top:
 *   get:
 *     summary: Lista os personagens mais favoritados
 *     description: Retorna os personagens com maior quantidade de favoritos.
 *     tags:
 *       - Ranking
 *     responses:
 *       200:
 *         description: Ranking de personagens retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: Monkey D. Luffy
 *                   imagem:
 *                     type: string
 *                     example: /images/personagens/luffy.jpg
 *                   papel:
 *                     type: string
 *                     nullable: true
 *                     example: Protagonista
 *                   afiliacao:
 *                     type: string
 *                     nullable: true
 *                     example: Chapéus de Palha
 *                   totalFavoritos:
 *                     type: integer
 *                     example: 35
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.get(
  '/ranking/personagens/top',
  rankingController.getTopPersonagens
);

export default RankingRouter;
