import { Router } from 'express';
import * as temporadasControlador from '../controllers/temporadasControlador';

export const temporadasRouter = Router();

/**
 * @swagger
 * /temporadas:
 *   get:
 *     tags: [Temporadas]
 *     summary: Listar temporadas
 *     responses:
 *       200:
 *         description: Lista de temporadas
 */
temporadasRouter.get('/', temporadasControlador.listarTemporadas);

/**
 * @swagger
 * /temporadas/por-anime:
 *   get:
 *     tags: [Temporadas]
 *     summary: Listar temporadas por anime
 *     parameters:
 *       - in: query
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de temporadas do anime
 */
temporadasRouter.get(
  '/por-anime',
  temporadasControlador.listarTemporadasPorAnime,
);

/**
 * @swagger
 * /temporadas/{id}:
 *   get:
 *     tags: [Temporadas]
 *     summary: Buscar temporada por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Temporada encontrada
 */
temporadasRouter.get('/:id', temporadasControlador.buscarTemporadaPorId);

/**
 * @swagger
 * /temporadas:
 *   post:
 *     tags: [Temporadas]
 *     summary: Criar temporada
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
 *         description: Temporada criada
 */
temporadasRouter.post('/', temporadasControlador.criarTemporada);

/**
 * @swagger
 * /temporadas/{id}:
 *   put:
 *     tags: [Temporadas]
 *     summary: Atualizar temporada
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
 *     responses:
 *       200:
 *         description: Temporada atualizada
 */
temporadasRouter.put('/:id', temporadasControlador.atualizarTemporada);

/**
 * @swagger
 * /temporadas/{id}:
 *   delete:
 *     tags: [Temporadas]
 *     summary: Remover temporada
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
 *         description: Temporada removida
 */
temporadasRouter.delete('/:id', temporadasControlador.deletarTemporada);
