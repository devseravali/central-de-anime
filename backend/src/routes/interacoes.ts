import { Router } from 'express';

import { interacaoController } from '../controllers/interacaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const InteracoesRouter = Router();

/**
 * @swagger
 * /animes/{animeId}/favoritar:
 *   post:
 *     summary: Adiciona um anime aos favoritos
 *     description: Adiciona o anime informado à lista de favoritos do usuário autenticado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         description: ID do anime que será favoritado
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Anime adicionado aos favoritos com sucesso
 *       400:
 *         description: ID do anime inválido ou dados inválidos
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Anime não encontrado
 *       409:
 *         description: Anime já está nos favoritos
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.post(
  '/animes/:animeId/favoritar',
  authMiddleware,
  interacaoController.favoritarAnime
);

/**
 * @swagger
 * /animes/{animeId}/desfavoritar:
 *   post:
 *     summary: Remove um anime dos favoritos
 *     description: Remove o anime informado da lista de favoritos do usuário autenticado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         description: ID do anime que será removido dos favoritos
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Anime removido dos favoritos com sucesso
 *       400:
 *         description: ID do anime inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Anime não encontrado ou não está nos favoritos
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.post(
  '/animes/:animeId/desfavoritar',
  authMiddleware,
  interacaoController.desfavoritarAnime
);

/**
 * @swagger
 * /animes/{animeId}/nota:
 *   post:
 *     summary: Avalia um anime
 *     description: Registra ou atualiza a nota atribuída pelo usuário autenticado ao anime informado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         description: ID do anime que será avaliado
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dados necessários para registrar a nota do anime.
 *     responses:
 *       200:
 *         description: Nota registrada ou atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou nota fora dos valores permitidos
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Anime não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.post(
  '/animes/:animeId/nota',
  authMiddleware,
  interacaoController.darNota
);

/**
 * @swagger
 * /animes/{animeId}/nota:
 *   delete:
 *     summary: Remove a nota de um anime
 *     description: Remove a avaliação feita pelo usuário autenticado para o anime informado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         description: ID do anime cuja nota será removida
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Nota removida com sucesso
 *       400:
 *         description: ID do anime inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Nota não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.delete(
  '/animes/:animeId/nota',
  authMiddleware,
  interacaoController.removerNota
);

/**
 * @swagger
 * /personagens/{personagemId}/favoritar:
 *   post:
 *     summary: Adiciona um personagem aos favoritos
 *     description: Adiciona o personagem informado à lista de favoritos do usuário autenticado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personagemId
 *         required: true
 *         description: ID do personagem que será favoritado
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Personagem adicionado aos favoritos com sucesso
 *       400:
 *         description: ID do personagem inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Personagem não encontrado
 *       409:
 *         description: Personagem já está nos favoritos
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.post(
  '/personagens/:personagemId/favoritar',
  authMiddleware,
  interacaoController.favoritarPersonagem
);

/**
 * @swagger
 * /personagens/{personagemId}/desfavoritar:
 *   post:
 *     summary: Remove um personagem dos favoritos
 *     description: Remove o personagem informado da lista de favoritos do usuário autenticado.
 *     tags:
 *       - Interações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personagemId
 *         required: true
 *         description: ID do personagem que será removido dos favoritos
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Personagem removido dos favoritos com sucesso
 *       400:
 *         description: ID do personagem inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       404:
 *         description: Personagem não encontrado ou não está nos favoritos
 *       500:
 *         description: Erro interno do servidor
 */
InteracoesRouter.post(
  '/personagens/:personagemId/desfavoritar',
  authMiddleware,
  interacaoController.desfavoritarPersonagem
);

export default InteracoesRouter;