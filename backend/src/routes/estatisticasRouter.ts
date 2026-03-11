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
import { obterEstatisticasUsuarios } from '../controllers/estatisticasControlador';

export const estatisticasRouter = Router();

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Retorna estatísticas completas
 *     responses:
 *       200:
 *         description: Estatísticas completas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/simples:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Retorna estatísticas simples
 *     responses:
 *       200:
 *         description: Estatísticas simples
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/generos:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por gênero
 *     responses:
 *       200:
 *         description: Estatísticas por gênero
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/estudios:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por estúdio
 *     responses:
 *       200:
 *         description: Estatísticas por estúdio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/plataformas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por plataforma
 *     responses:
 *       200:
 *         description: Estatísticas por plataforma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/status:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por status
 *     responses:
 *       200:
 *         description: Estatísticas por status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/tags:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por tag
 *     responses:
 *       200:
 *         description: Estatísticas por tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/temporadas:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por temporada
 *     responses:
 *       200:
 *         description: Estatísticas por temporada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/estacoes:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por estação
 *     responses:
 *       200:
 *         description: Estatísticas por estação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/personagens:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por personagem
 *     responses:
 *       200:
 *         description: Estatísticas por personagem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/animes:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas por anime
 *     responses:
 *       200:
 *         description: Estatísticas por anime
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/populares:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas de animes populares
 *     responses:
 *       200:
 *         description: Estatísticas de animes populares
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 * /estatisticas/usuarios:
 *   get:
 *     tags: [Estatisticas]
 *     summary: Estatísticas de usuários
 *     responses:
 *       200:
 *         description: Estatísticas de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estatistica'
 */

estatisticasRouter.get('/', obterEstatisticas);
estatisticasRouter.get('/simples', obterEstatisticasSimples);
estatisticasRouter.get('/generos', obterEstatisticasGeneros);
estatisticasRouter.get('/estudios', obterEstatisticasEstudios);
estatisticasRouter.get('/plataformas', obterEstatisticasPlataformas);
estatisticasRouter.get('/status', obterEstatisticasStatus);
estatisticasRouter.get('/tags', obterEstatisticasTags);
estatisticasRouter.get('/temporadas', obterEstatisticasTemporadas);
estatisticasRouter.get('/estacoes', obterEstatisticasEstacoes);
estatisticasRouter.get('/personagens', obterEstatisticasPersonagens);
estatisticasRouter.get('/animes', obterEstatisticasAnimes);
estatisticasRouter.get('/populares', obterEstatisticasPopulares);
estatisticasRouter.get('/usuarios', obterEstatisticasUsuarios);