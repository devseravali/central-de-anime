import { Router } from 'express';
import {
  buscarTodos,
  buscarPorId,
  buscarComTitulos,
  buscarNomes,
  adicionarAnime,
  atualizarAnime,
  deletarAnime,
  buscarTemporadas,
  buscarTemporadasQuantidade,
  buscarTemporadasAnos,
} from '../controllers/animesControlador';

const animesRouter = Router();

/**
 * @swagger
 * /animes:
 *   get:
 *     tags: [Animes]
 *     summary: Listar todos os animes
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
 * /animes/nomes:
 *   get:
 *     tags: [Animes]
 *     summary: Listar nomes dos animes
 *     responses:
 *       200:
 *         description: Lista de nomes de animes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/nomes', buscarNomes);

/**
 * @swagger
 * /animes/titulos:
 *   get:
 *     tags: [Animes]
 *     summary: Listar animes com títulos
 *     responses:
 *       200:
 *         description: Lista de animes com títulos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/titulos', buscarComTitulos);

/**
 * @swagger
 * /animes/temporadas:
 *   get:
 *     tags: [Animes]
 *     summary: Listar todas as temporadas distintas
 *     responses:
 *       200:
 *         description: Lista de temporadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/temporadas', buscarTemporadas);

/**
 * @swagger
 * /animes/temporadas/quantidade:
 *   get:
 *     tags: [Animes]
 *     summary: Listar temporadas com quantidade de animes
 *     description: Retorna todas as temporadas distintas e a quantidade de animes em cada uma
 *     responses:
 *       200:
 *         description: Lista de temporadas com quantidade de animes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/temporadas/quantidade', buscarTemporadasQuantidade);

/**
 * @swagger
 * /animes/temporadas/anos:
 *   get:
 *     tags: [Animes]
 *     summary: Listar anos distintos das temporadas
 *     responses:
 *       200:
 *         description: Lista de anos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.get('/temporadas/anos', buscarTemporadasAnos);

/**
 * @swagger
 * /animes/{id}:
 *   get:
 *     tags: [Animes]
 *     summary: Buscar anime por ID
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
 */
animesRouter.get('/:id', buscarPorId);

/**
 * @swagger
 * /animes:
 *   post:
 *     tags: [Animes]
 *     summary: Criar anime
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Anime'
 *     responses:
 *       201:
 *         description: Anime criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */
animesRouter.post('/', adicionarAnime);

/**
 * @swagger
 * /animes/{id}:
 *   put:
 *     tags: [Animes]
 *     summary: Atualizar anime
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