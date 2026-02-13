import { db } from '../db';
import { animes } from '../schema/animes';
import { estudios } from '../schema/estudios';
import { Router } from 'express';
import * as estudiosControlador from '../controllers/estudiosControlador';

export const estudiosRouter = Router();

/**
 * @swagger
 * /estudios:
 *   get:
 *     tags: [Estudios]
 *     summary: Listar estudios
 *     responses:
 *       200:
 *         description: Lista de estudios
 */
estudiosRouter.get('/', estudiosControlador.buscarTodosEstudios);

/**
 * @swagger
 * /estudios/{id}:
 *   get:
 *     tags: [Estudios]
 *     summary: Buscar estudio por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estudio encontrado
 */
estudiosRouter.get('/:id', estudiosControlador.buscarEstudioPorId);

/**
 * @swagger
 * /estudios/{nome}/principais-obras:
 *   get:
 *     tags: [Estudios]
 *     summary: Listar animes por nome do estudio
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes por estudio
 */
estudiosRouter.get(
  '/:nome/principais-obras',
  estudiosControlador.listarAnimesPorNomeEstudio,
);

/**
 * @swagger
 * /estudios/{id}/animes:
 *   get:
 *     tags: [Estudios]
 *     summary: Listar animes por estudio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes por estudio
 */
estudiosRouter.get('/:id/animes', estudiosControlador.listarAnimesPorEstudio);

/**
 * @swagger
 * /estudios/nome/{nome}/animes:
 *   get:
 *     tags: [Estudios]
 *     summary: Listar animes por nome do estudio
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes por estudio
 */
estudiosRouter.get(
  '/nome/:nome/animes',
  estudiosControlador.listarAnimesPorNomeEstudio,
);

/**
 * @swagger
 * /estudios:
 *   post:
 *     tags: [Estudios]
 *     summary: Criar estudio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estudio criado
 */
estudiosRouter.post('/', estudiosControlador.adicionarEstudio);

/**
 * @swagger
 * /estudios/{id}:
 *   put:
 *     tags: [Estudios]
 *     summary: Atualizar estudio
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
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estudio atualizado
 */
estudiosRouter.put('/:id', estudiosControlador.atualizarEstudio);

/**
 * @swagger
 * /estudios/{id}:
 *   delete:
 *     tags: [Estudios]
 *     summary: Remover estudio
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
 *         description: Estudio removido
 */
estudiosRouter.delete('/:id', estudiosControlador.deletarEstudio);
