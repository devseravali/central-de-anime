import { Router } from 'express';
import * as filtrosControlador from '../controllers/filtrosControlador';

export const filtrosRouter = Router();
/**
 * @swagger
 * /filtros:
 *   get:
 *     tags: [Filtros]
 *     summary: Retorna filtros disponíveis
 *     responses:
 *       200:
 *         description: Filtros disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filtros'
 * /filtros/generos:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por gênero
 *     responses:
 *       200:
 *         description: Lista de animes por gênero
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/status:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por status
 *     responses:
 *       200:
 *         description: Lista de animes por status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/estudios:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por estúdio
 *     responses:
 *       200:
 *         description: Lista de animes por estúdio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/estacoes:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por estação
 *     responses:
 *       200:
 *         description: Lista de animes por estação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/anos:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por ano
 *     responses:
 *       200:
 *         description: Lista de animes por ano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/generos/{nome}:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por nome do gênero
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
 *               $ref: '#/components/schemas/Anime'
 * /filtros/status/{id}:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por id do status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/estudios/{nome}:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por nome do estúdio
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes do estúdio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/estacoes/{id}:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por id da estação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes da estação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/anos/{valor}:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes por valor do ano
 *     parameters:
 *       - in: path
 *         name: valor
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do ano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/buscar:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca animes com múltiplos filtros
 *     responses:
 *       200:
 *         description: Lista de animes filtrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 * /filtros/personagens:
 *   get:
 *     tags: [Filtros]
 *     summary: Busca personagens com filtros
 *     responses:
 *       200:
 *         description: Lista de personagens filtrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personagem'
 */

filtrosRouter.get('/', filtrosControlador.getFiltros);

filtrosRouter.get('/generos', filtrosControlador.buscarAnimesPorGenero);

filtrosRouter.get('/status', filtrosControlador.buscarAnimesPorStatus);

filtrosRouter.get('/estudios', filtrosControlador.buscarAnimesPorStatus);

filtrosRouter.get('/estacoes', filtrosControlador.buscarAnimesPorStatus);

filtrosRouter.get('/anos', filtrosControlador.buscarAnimesPorGenero);

filtrosRouter.get(
  '/generos/:nome',
  filtrosControlador.buscarAnimesPorGeneroNome,
);

filtrosRouter.get('/status/:id', filtrosControlador.buscarAnimesPorStatus);

filtrosRouter.get(
  '/estudios/:nome',
  filtrosControlador.buscarAnimesPorEstudioNome,
);

filtrosRouter.get('/estacoes/:id', filtrosControlador.buscarAnimesPorStatus);

filtrosRouter.get('/anos/:valor', filtrosControlador.buscarAnimesPorAnoValor);

filtrosRouter.get('/buscar', filtrosControlador.buscarAnimesComFiltros);

filtrosRouter.get(
  '/personagens',
  filtrosControlador.buscarPersonagensComFiltros,
);