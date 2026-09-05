import { Router } from 'express';

import { personagemController } from '../controllers/personagemController';

const PersonagensRouter = Router();

/**
 * @swagger
 * /personagens:
 *   get:
 *     summary: Lista todos os personagens
 *     description: Retorna a lista de personagens cadastrados na Central de Anime.
 *     tags:
 *       - Personagens
 *     responses:
 *       200:
 *         description: Lista de personagens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Dados de um personagem
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
PersonagensRouter.get(
  '/',
  personagemController.list
);

/**
 * @swagger
 * /personagens/{id}:
 *   get:
 *     summary: Busca um personagem pelo ID
 *     description: Retorna os dados de um personagem específico.
 *     tags:
 *       - Personagens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do personagem
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Personagem encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Dados do personagem
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Personagem não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
PersonagensRouter.get(
  '/:id',
  personagemController.getById
);

export default PersonagensRouter;