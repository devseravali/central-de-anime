import { Router } from 'express';
import {
  listarTodosAnimes,
  listarNomesAnimes,
  listarAnosAnimes,
  buscarAnimePorId,
  criarAnime,
  atualizarAnime,
  deletarAnime,
  listarAnimesPorTemporada,
  listarQuantidadePorTemporada,
} from '../controllers/animesControlador';

export const animesRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Animes
 *     description: Operações de consulta e gestão de animes
 *
 * /animes:
 *   get:
 *     tags: [Animes]
 *     summary: Lista todos os animes
 *     responses:
 *       200:
 *         description: Lista de animes
 *
 *   post:
 *     tags: [Animes]
 *     summary: Cria um novo anime
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               ano:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Anime criado
 *
 * /animes/titulos:
 *   get:
 *     tags: [Animes]
 *     summary: Lista títulos de animes
 *     responses:
 *       200:
 *         description: Lista de títulos
 *
 * /animes/nomes:
 *   get:
 *     tags: [Animes]
 *     summary: Lista nomes de animes
 *     responses:
 *       200:
 *         description: Lista de nomes
 *
 * /animes/anos:
 *   get:
 *     tags: [Animes]
 *     summary: Lista anos disponíveis
 *     responses:
 *       200:
 *         description: Lista de anos
 *
 * /animes/temporada/agrupado:
 *   get:
 *     tags: [Animes]
 *     summary: Lista animes agrupados por temporada
 *     responses:
 *       200:
 *         description: Animes agrupados por temporada
 *
 * /animes/temporada/quantidade:
 *   get:
 *     tags: [Animes]
 *     summary: Retorna quantidade de animes por temporada
 *     responses:
 *       200:
 *         description: Quantidade por temporada
 *
 * /animes/{id}:
 *   get:
 *     tags: [Animes]
 *     summary: Busca anime por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anime encontrado
 *
 *   put:
 *     tags: [Animes]
 *     summary: Atualiza anime por ID
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
 *               titulo:
 *                 type: string
 *               ano:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Anime atualizado
 *
 *   delete:
 *     tags: [Animes]
 *     summary: Remove anime por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Anime removido
 */

animesRouter.get('/', listarTodosAnimes);
animesRouter.get('/animes', listarTodosAnimes);
animesRouter.get('/titulos', listarTodosAnimes);
animesRouter.get('/nomes', listarNomesAnimes);
animesRouter.get('/anos', listarAnosAnimes);
animesRouter.get('/temporada/agrupado', listarAnimesPorTemporada);
animesRouter.get('/temporada/quantidade', listarQuantidadePorTemporada);
animesRouter.get('/:id', buscarAnimePorId);
animesRouter.post('/', criarAnime);
animesRouter.put('/:id', atualizarAnime);
animesRouter.delete('/:id', deletarAnime);
