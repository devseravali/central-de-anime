import { Router } from 'express';
import {
  obterTodasPlataformas,
  obterPlataformaPorId,
  listarAnimesPorPlataforma,
  criarPlataforma,
  atualizarPlataforma,
  deletarPlataforma,
} from '../controllers/plataformasControlador';

export const plataformasRouter = Router();

/**
 * @swagger
 * /plataformas:
 *   get:
 *     tags: [Plataformas]
 *     summary: Listar plataformas
 *     responses:
 *       200:
 *         description: Lista de plataformas
 */
plataformasRouter.get('/', obterTodasPlataformas);

/**
 * @swagger
 * /plataformas/{id}:
 *   get:
 *     tags: [Plataformas]
 *     summary: Buscar plataforma por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plataforma encontrada
 */
plataformasRouter.get('/:id', obterPlataformaPorId);

/**
 * @swagger
 * /plataformas/{id}/animes:
 *   get:
 *     tags: [Plataformas]
 *     summary: Listar animes por plataforma
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes da plataforma
 */
plataformasRouter.get('/:id/animes', listarAnimesPorPlataforma);

/**
 * @swagger
 * /plataformas:
 *   post:
 *     tags: [Plataformas]
 *     summary: Criar plataforma

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Plataforma criada
 */
plataformasRouter.post('/', criarPlataforma);

/**
 * @swagger
 * /plataformas/{id}:
 *   put:
 *     tags: [Plataformas]
 *     summary: Atualizar plataforma

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
 *         description: Plataforma atualizada
 */
plataformasRouter.put('/:id', atualizarPlataforma);

/**
 * @swagger
 * /plataformas/{id}:
 *   delete:
 *     tags: [Plataformas]
 *     summary: Remover plataforma

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plataforma removida
 */
plataformasRouter.delete('/:id', deletarPlataforma);
