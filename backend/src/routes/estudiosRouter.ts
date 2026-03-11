import { Router } from 'express';
import * as estudiosControlador from '../controllers/estudiosControlador';

export const estudiosRouter = Router();

/**
 * @swagger
 * /estudios:
 *   get:
 *     tags: [Estudios]
 *     summary: Lista todos os estúdios
 *     responses:
 *       200:
 *         description: Lista de estúdios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estudio'
 *   post:
 *     tags: [Estudios]
 *     summary: Cria um novo estúdio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstudioInput'
 *     responses:
 *       201:
 *         description: Estúdio criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudio'
 * /estudios/estatisticas:
 *   get:
 *     tags: [Estudios]
 *     summary: Estatísticas dos estúdios
 *     responses:
 *       200:
 *         description: Estatísticas dos estúdios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estudios/{id}:
 *   get:
 *     tags: [Estudios]
 *     summary: Busca estúdio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estúdio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudio'
 *   put:
 *     tags: [Estudios]
 *     summary: Atualiza estúdio por ID
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
 *             $ref: '#/components/schemas/EstudioInput'
 *     responses:
 *       200:
 *         description: Estúdio atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudio'
 *   delete:
 *     tags: [Estudios]
 *     summary: Deleta estúdio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Estúdio deletado
 * /estudios/nome/{nome}:
 *   get:
 *     tags: [Estudios]
 *     summary: Busca estúdio por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estúdio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudio'
 * /estudios/{id}/animes:
 *   get:
 *     tags: [Estudios]
 *     summary: Lista animes de um estúdio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do estúdio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anime'
 */

estudiosRouter.get('/', estudiosControlador.listarEstudios);
estudiosRouter.get('/estatisticas', estudiosControlador.listarEstudios);
estudiosRouter.get('/:id', estudiosControlador.buscarEstudioPorId);
estudiosRouter.get('/nome/:nome', estudiosControlador.buscarEstudioPorNome);
estudiosRouter.get('/:id/animes', estudiosControlador.listarAnimesPorEstudio);
estudiosRouter.post('/', estudiosControlador.criarEstudio);
estudiosRouter.put('/:id', estudiosControlador.atualizarEstudio);
estudiosRouter.delete('/:id', estudiosControlador.deletarEstudio);