// src/routes/animesRouter.ts
import { Router } from 'express';
import {
  buscarTodos,
  buscarPorId,
  buscarComTitulos,
  buscarNomes,
  adicionarAnime,
  atualizarAnime,
  deletarAnime,
} from '../controllers/animesControlador';

const animesRouter = Router();

/**
 * @swagger
 * /animes/titulos:
 *   get:
 *     tags: [Animes]
 *     summary: Listar animes com titulos
 *     responses:
 *       200:
 *         description: Lista de animes com titulos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/titulos', buscarComTitulos);

/**
 * @swagger
 * /animes/nomes:
 *   get:
 *     tags: [Animes]
 *     summary: Listar nomes dos animes
 *     responses:
 *       200:
 *         description: Lista de nomes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/nomes', buscarNomes);

/**
 * @swagger
 * /animes:
 *   get:
 *     tags: [Animes]
 *     summary: Listar animes
 *     responses:
 *       200:
 *         description: Lista de animes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/', buscarTodos);

/**
 * @swagger
 * /animes/{id}:
 *   get:
 *     tags: [Animes]
 *     summary: Buscar anime por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anime encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *       404:
 *         description: Anime nao encontrado
 */
animesRouter.get('/:id', buscarPorId);

/**
 * @swagger
 * /animes:
 *   post:
 *     tags: [Animes]
 *     summary: Criar anime
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Anime'
 *     responses:
 *       201:
 *         description: Anime criado
 */
animesRouter.post('/', adicionarAnime);

/**
 * @swagger
 * /animes/{id}:
 *   put:
 *     tags: [Animes]
 *     summary: Atualizar anime
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Anime'
 *     responses:
 *       200:
 *         description: Anime atualizado
 */
animesRouter.put('/:id', atualizarAnime);

/**
 * @swagger
 * /animes/{id}:
 *   delete:
 *     tags: [Animes]
 *     summary: Remover anime
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anime removido
 */
animesRouter.delete('/:id', deletarAnime);

export default animesRouter;
