import { Router } from 'express';
import {
  obterTodasPlataformas,
  obterPlataformaPorId,
  obterPlataformaPorNome,
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
 *     summary: Lista todas as plataformas
 *     responses:
 *       200:
 *         description: Lista de plataformas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plataforma'
 *   post:
 *     tags: [Plataformas]
 *     summary: Cria uma nova plataforma
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlataformaInput'
 *     responses:
 *       201:
 *         description: Plataforma criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plataforma'
 * /plataformas/{id}:
 *   get:
 *     tags: [Plataformas]
 *     summary: Busca plataforma por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plataforma encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plataforma'
 *   put:
 *     tags: [Plataformas]
 *     summary: Atualiza plataforma por ID
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
 *             $ref: '#/components/schemas/PlataformaInput'
 *     responses:
 *       200:
 *         description: Plataforma atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plataforma'
 *   delete:
 *     tags: [Plataformas]
 *     summary: Deleta plataforma por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Plataforma deletada
 * /plataformas/nome/{nome}:
 *   get:
 *     tags: [Plataformas]
 *     summary: Busca plataforma por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plataforma encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plataforma'
 * /plataformas/{id}/animes:
 *   get:
 *     tags: [Plataformas]
 *     summary: Lista animes de uma plataforma
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes da plataforma
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anime'
 */
plataformasRouter.get('/', obterTodasPlataformas);
plataformasRouter.get('/:id', obterPlataformaPorId);
plataformasRouter.get('/nome/:nome', obterPlataformaPorNome);
plataformasRouter.get('/:id/animes', listarAnimesPorPlataforma);
plataformasRouter.post('/', criarPlataforma);
plataformasRouter.put('/:id', atualizarPlataforma);
plataformasRouter.delete('/:id', deletarPlataforma);
