import { Router } from 'express';

import { rankingController } from '../controllers/rankingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const RankingRouter = Router();

/**
 * @swagger
 * /ranking/{usuarioId}:
 *   get:
 *     summary: Busca o ranking de um usuário
 *     description: Retorna as informações de ranking do usuário autenticado ou do usuário informado.
 *     tags:
 *       - Ranking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ranking do usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dados do ranking do usuário
 *       400:
 *         description: ID do usuário inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Ranking ou usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.get(
  '/ranking/:usuarioId',
  authMiddleware,
  rankingController.getByUsuarioId
);

/**
 * @swagger
 * /ranking/{usuarioId}/pontos:
 *   get:
 *     summary: Consulta os pontos de um usuário
 *     description: Retorna a pontuação acumulada do usuário no ranking.
 *     tags:
 *       - Ranking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Pontos do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Informações de pontuação do usuário
 *       400:
 *         description: ID do usuário inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário ou pontuação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.get(
  '/ranking/:usuarioId/pontos',
  authMiddleware,
  rankingController.getPontos
);

/**
 * @swagger
 * /ranking/{usuarioId}/atualizar:
 *   post:
 *     summary: Atualiza o ranking de um usuário
 *     description: Atualiza os dados de ranking do usuário informado.
 *     tags:
 *       - Ranking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ranking atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Ranking atualizado
 *       400:
 *         description: ID do usuário inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.post(
  '/ranking/:usuarioId/atualizar',
  authMiddleware,
  rankingController.atualizar
);

/**
 * @swagger
 * /ranking/{usuarioId}/recalcular:
 *   post:
 *     summary: Recalcula o ranking de um usuário
 *     description: Recalcula a pontuação e os dados de ranking do usuário informado.
 *     tags:
 *       - Ranking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ranking recalculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Ranking recalculado
 *       400:
 *         description: ID do usuário inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.post(
  '/ranking/:usuarioId/recalcular',
  authMiddleware,
  rankingController.recalcular
);

/**
 * @swagger
 * /ranking/top:
 *   get:
 *     summary: Lista os usuários com maior pontuação
 *     description: Retorna o ranking geral dos usuários com maior pontuação.
 *     tags:
 *       - Ranking
 *     responses:
 *       200:
 *         description: Ranking geral retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Usuário e informações de ranking
 *       500:
 *         description: Erro interno do servidor
 */
RankingRouter.get(
  '/ranking/top',
  rankingController.getTop
);

export default RankingRouter;