import { Router } from 'express';
import * as dadosControlador from '../controllers/dadosControlador';

const dadosRouter = Router();

/**
 * @swagger
 * /dados:
 *   get:
 *     tags: [Dados]
 *     summary: Listar todos os dados
 *     responses:
 *       200:
 *         description: Dados agregados
 */
dadosRouter.get('/', dadosControlador.listarDados);

/**
 * @swagger
 * /dados/generos:
 *   get:
 *     tags: [Dados]
 *     summary: Listar gêneros
 *     responses:
 *       200:
 *         description: Lista de gêneros
 */
dadosRouter.get('/generos', dadosControlador.listarGeneros);

/**
 * @swagger
 * /dados/plataformas:
 *   get:
 *     tags: [Dados]
 *     summary: Listar plataformas
 *     responses:
 *       200:
 *         description: Lista de plataformas
 */
dadosRouter.get('/plataformas', dadosControlador.listarPlataformas);

/**
 * @swagger
 * /dados/status:
 *   get:
 *     tags: [Dados]
 *     summary: Listar status
 *     responses:
 *       200:
 *         description: Lista de status
 */
dadosRouter.get('/status', dadosControlador.listarStatus);

/**
 * @swagger
 * /dados/tags:
 *   get:
 *     tags: [Dados]
 *     summary: Listar tags
 *     responses:
 *       200:
 *         description: Lista de tags
 */
dadosRouter.get('/tags', dadosControlador.listarTags);

/**
 * @swagger
 * /dados/temporadas:
 *   get:
 *     tags: [Dados]
 *     summary: Listar temporadas
 *     responses:
 *       200:
 *         description: Lista de temporadas
 */
dadosRouter.get('/temporadas', dadosControlador.listarTemporadas);

/**
 * @swagger
 * /dados/estudios:
 *   get:
 *     tags: [Dados]
 *     summary: Listar estúdios
 *     responses:
 *       200:
 *         description: Lista de estúdios
 */
dadosRouter.get('/estudios', dadosControlador.listarEstudios);

/**
 * @swagger
 * /dados/estacoes:
 *   get:
 *     tags: [Dados]
 *     summary: Listar estações
 *     responses:
 *       200:
 *         description: Lista de estações
 */
dadosRouter.get('/estacoes', dadosControlador.listarEstacoes);

/**
 * @swagger
 * /dados/animes:
 *   get:
 *     tags: [Dados]
 *     summary: Listar animes
 *     responses:
 *       200:
 *         description: Lista de animes
 */
dadosRouter.get('/animes', dadosControlador.listarAnimes);

/**
 * @swagger
 * /dados/personagens:
 *   get:
 *     tags: [Dados]
 *     summary: Listar personagens
 *     responses:
 *       200:
 *         description: Lista de personagens
 */
dadosRouter.get('/personagens', dadosControlador.listarPersonagens);

/**
 * @swagger
 * /dados/buscar/{entidade}/{nome}:
 *   get:
 *     tags: [Dados]
 *     summary: Buscar entidade por nome
 *     parameters:
 *       - in: path
 *         name: entidade
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado da busca
 */
dadosRouter.get('/buscar/:entidade/:nome', dadosControlador.buscarPorNome);

export { dadosRouter };
