import { Router } from 'express';
import * as generosControlador from '../controllers/generosControlador';

export const generosRouter = Router();
/**
 * @swagger
 * /generos:
 *   get:
 *     tags: [Gêneros]
 *     summary: Lista todos os gêneros
 *     responses:
 *       200:
 *         description: Lista de gêneros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genero'
 *   post:
 *     tags: [Gêneros]
 *     summary: Adiciona um novo gênero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneroInput'
 *     responses:
 *       201:
 *         description: Gênero criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genero'
 * /generos/busca/{nome}:
 *   get:
 *     tags: [Gêneros]
 *     summary: Busca gênero por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gênero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genero'
 * /generos/{nome}/animes:
 *   get:
 *     tags: [Gêneros]
 *     summary: Lista animes por gênero
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes do gênero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anime'
 * /generos/{id}:
 *   get:
 *     tags: [Gêneros]
 *     summary: Busca gênero por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gênero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genero'
 *   put:
 *     tags: [Gêneros]
 *     summary: Atualiza gênero por ID
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
 *             $ref: '#/components/schemas/GeneroInput'
 *     responses:
 *       200:
 *         description: Gênero atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genero'
 *   delete:
 *     tags: [Gêneros]
 *     summary: Deleta gênero por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Gênero deletado
 */

generosRouter.get('/', generosControlador.buscarTodosGeneros);
generosRouter.get('/busca/:nome', generosControlador.buscarGeneroPorNome);
generosRouter.get('/:nome/animes', generosControlador.listarAnimesPorGenero);
generosRouter.get('/:id', generosControlador.buscarGeneroPorId);
generosRouter.post('/', generosControlador.adicionarGenero);
generosRouter.put('/:id', generosControlador.atualizarGenero);
generosRouter.delete('/:id', generosControlador.deletarGenero);
