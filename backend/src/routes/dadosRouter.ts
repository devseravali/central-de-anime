import { Router } from 'express';
import {
  buscarDados,
  buscarPlataformas,
  buscarTags,
  buscarStatus,
  buscarTemporadas,
  buscarEstudios,
  buscarEstacoes,
  buscarAnimes,
  buscarPersonagens,
  buscarGeneros,
} from '../controllers/dadosControlador';

export const dadosRouter = Router();

/**
 * @swagger
 * /dados:
 *   get:
 *     tags: [Dados]
 *     summary: Retorna dados gerais (animes, generos, plataformas, tags, estacoes)
 *     responses:
 *       200:
 *         description: Dados gerais
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/generos:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todos os gêneros
 *     responses:
 *       200:
 *         description: Lista de gêneros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/plataformas:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todas as plataformas
 *     responses:
 *       200:
 *         description: Lista de plataformas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/tags:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todas as tags
 *     responses:
 *       200:
 *         description: Lista de tags
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/status:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todos os status
 *     responses:
 *       200:
 *         description: Lista de status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/temporadas:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todas as temporadas
 *     responses:
 *       200:
 *         description: Lista de temporadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/estudios:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todos os estúdios
 *     responses:
 *       200:
 *         description: Lista de estúdios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/estacoes:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todas as estações
 *     responses:
 *       200:
 *         description: Lista de estações
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/animes:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todos os animes
 *     responses:
 *       200:
 *         description: Lista de animes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /dados/personagens:
 *   get:
 *     tags: [Dados]
 *     summary: Lista todos os personagens
 *     responses:
 *       200:
 *         description: Lista de personagens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */

dadosRouter.get('/', buscarDados);
dadosRouter.get('/generos', buscarGeneros);
dadosRouter.get('/plataformas', buscarPlataformas);
dadosRouter.get('/tags', buscarTags);
dadosRouter.get('/status', buscarStatus);
dadosRouter.get('/temporadas', buscarTemporadas);
dadosRouter.get('/estudios', buscarEstudios);
dadosRouter.get('/estacoes', buscarEstacoes);
dadosRouter.get('/animes', buscarAnimes);
dadosRouter.get('/personagens', buscarPersonagens);
