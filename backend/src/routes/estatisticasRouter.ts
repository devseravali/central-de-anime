import { Router } from 'express';
import {
  obterEstatisticas,
  obterEstatisticasSimples,
  obterEstatisticasGeneros,
  obterEstatisticasEstudios,
  obterEstatisticasPlataformas,
  obterEstatisticasStatus,
  obterEstatisticasTags,
  obterEstatisticasTemporadas,
  obterEstatisticasEstacoes,
  obterEstatisticasPersonagens,
  obterEstatisticasAnimes,
  obterEstatisticasPopulares,
} from '../controllers/estatisticasControlador';

const estatisticasRouter = Router();

/**
 * @swagger
 * /estatisticas/populares:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas populares (tags, status, gêneros, estúdios, plataformas)
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Estatísticas populares das principais entidades
 */
estatisticasRouter.get('/populares', obterEstatisticasPopulares);

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas gerais
 *     responses:
 *       200:
 *         description: Estatisticas gerais
 */
estatisticasRouter.get('/', obterEstatisticas);

/**
 * @swagger
 * /estatisticas/simples:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas simples
 *     responses:
 *       200:
 *         description: Estatisticas simples
 */
estatisticasRouter.get('/simples', obterEstatisticasSimples);

/**
 * @swagger
 * /estatisticas/generos:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por genero
 *     responses:
 *       200:
 *         description: Estatisticas por genero
 */
estatisticasRouter.get('/generos', obterEstatisticasGeneros);

/**
 * @swagger
 * /estatisticas/estudios:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por estudio
 *     responses:
 *       200:
 *         description: Estatisticas por estudio
 */
estatisticasRouter.get('/estudios', obterEstatisticasEstudios);

/**
 * @swagger
 * /estatisticas/plataformas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por plataforma
 *     responses:
 *       200:
 *         description: Estatisticas por plataforma
 */
estatisticasRouter.get('/plataformas', obterEstatisticasPlataformas);

/**
 * @swagger
 * /estatisticas/status:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por status
 *     responses:
 *       200:
 *         description: Estatisticas por status
 */
estatisticasRouter.get('/status', obterEstatisticasStatus);

/**
 * @swagger
 * /estatisticas/tags:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por tags
 *     responses:
 *       200:
 *         description: Estatisticas por tags
 */
estatisticasRouter.get('/tags', obterEstatisticasTags);

/**
 * @swagger
 * /estatisticas/temporadas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por temporadas
 *     parameters:
 *       - in: query
 *         name: ano
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatisticas por temporadas
 */
estatisticasRouter.get('/temporadas', obterEstatisticasTemporadas);

/**
 * @swagger
 * /estatisticas/estacoes:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por estacoes
 *     responses:
 *       200:
 *         description: Estatisticas por estacoes
 */
estatisticasRouter.get('/estacoes', obterEstatisticasEstacoes);

/**
 * @swagger
 * /estatisticas/personagens:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por personagens
 *     responses:
 *       200:
 *         description: Estatisticas por personagens
 */
estatisticasRouter.get('/personagens', obterEstatisticasPersonagens);

/**
 * @swagger
 * /estatisticas/animes:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatisticas por animes
 *     responses:
 *       200:
 *         description: Estatisticas por animes
 */
estatisticasRouter.get('/animes', obterEstatisticasAnimes);

export { estatisticasRouter };
