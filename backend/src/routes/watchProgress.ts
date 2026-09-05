import { RequestHandler, Router } from 'express';

import { watchProgressController } from '../controllers/watchProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';

import {
  episodioIdParamSchema,
  usuarioEpisodioParamsSchema,
  updateProgressBodySchema,
} from '../schemas/watchProgress/progress.schemas';

const WatchProgressRouter = Router();

/**
 * @swagger
 * /usuarios/{usuarioId}/episodios/{episodioId}/progresso:
 *   get:
 *     summary: Consulta o progresso de um episódio
 *     description: Retorna o progresso do usuário autenticado em um episódio específico.
 *     tags:
 *       - Progresso
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
 *       - in: path
 *         name: episodioId
 *         required: true
 *         description: ID do episódio
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Progresso retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dados do progresso do episódio
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Progresso ou episódio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
WatchProgressRouter.get(
  '/usuarios/:usuarioId/episodios/:episodioId/progresso',
  authMiddleware,
  watchProgressController.getProgress as unknown as RequestHandler
);

/**
 * @swagger
 * /episodios/{episodioId}/progresso:
 *   put:
 *     summary: Atualiza o progresso de um episódio
 *     description: Atualiza o progresso do episódio para o usuário autenticado.
 *     tags:
 *       - Progresso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodioId
 *         required: true
 *         description: ID do episódio
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dados utilizados para atualizar o progresso do episódio.
 *     responses:
 *       200:
 *         description: Progresso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Progresso atualizado
 *       400:
 *         description: Dados de progresso inválidos
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Episódio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
WatchProgressRouter.put(
  '/episodios/:episodioId/progresso',
  authMiddleware,
  validationMiddleware({
    params: episodioIdParamSchema,
    body: updateProgressBodySchema,
  }),
  watchProgressController.updateProgress as unknown as RequestHandler
);

/**
 * @swagger
 * /episodios/{episodioId}/concluir:
 *   post:
 *     summary: Marca um episódio como concluído
 *     description: Marca o episódio informado como concluído para o usuário autenticado.
 *     tags:
 *       - Progresso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodioId
 *         required: true
 *         description: ID do episódio
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Episódio marcado como concluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Progresso atualizado
 *       400:
 *         description: ID do episódio inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Episódio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
WatchProgressRouter.post(
  '/episodios/:episodioId/concluir',
  authMiddleware,
  validationMiddleware({
    params: episodioIdParamSchema,
  }),
  watchProgressController.markAsCompleted as unknown as RequestHandler
);

export default WatchProgressRouter;