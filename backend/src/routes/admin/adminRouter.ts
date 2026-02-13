import { Router } from 'express';
import { estatisticasRouter } from '../estatisticasRouter';
import { autenticacaoMiddleware } from '../../middleware/autenticacao';
import { modRouter } from './modRouter';
import { autenticarAdmin } from '../../controllers/adminAuthControlador';

const adminRouter = Router();
const adminGuard = [autenticacaoMiddleware];
const modGuard = process.env.NODE_ENV === 'test' ? [] : adminGuard;

/**
 * @swagger
 * /admin/health:
 *   get:
 *     tags: [Admin]
 *     summary: Healthcheck da API admin
 *     responses:
 *       200:
 *         description: Admin API OK
 */
adminRouter.get('/health', (_req, res) => {
  return res.status(200).json({ sucesso: true, mensagem: 'Admin API OK' });
});

/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Autenticar admin e gerar token JWT
 *     description: |
 *       Opcao 1: Envie JSON com email e senha.
 *       Opcao 2: Envie Authorization Bearer com ID token Google (sem body).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token gerado
 */
adminRouter.post('/login', autenticarAdmin);

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     tags: [Admin]
 *     summary: Autenticar admin e gerar token JWT (alias)
 *     description: |
 *       Opcao 1: Envie JSON com email e senha.
 *       Opcao 2: Envie Authorization Bearer com ID token Google (sem body).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token gerado
 */
adminRouter.post('/auth/login', autenticarAdmin);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas gerais (admin)
 *     responses:
 *       200:
 *         description: Estatisticas gerais
 */
/**
 * @swagger
 * /admin/stats/simples:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas simples (admin)
 *     responses:
 *       200:
 *         description: Estatisticas simples
 */
/**
 * @swagger
 * /admin/stats/generos:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por genero (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por genero
 */
/**
 * @swagger
 * /admin/stats/estudios:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por estudio (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por estudio
 */
/**
 * @swagger
 * /admin/stats/plataformas:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por plataforma (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por plataforma
 */
/**
 * @swagger
 * /admin/stats/status:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por status (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por status
 */
/**
 * @swagger
 * /admin/stats/tags:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por tags (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por tags
 */
/**
 * @swagger
 * /admin/stats/temporadas:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por temporadas (admin)
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
/**
 * @swagger
 * /admin/stats/estacoes:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por estacoes (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por estacoes
 */
/**
 * @swagger
 * /admin/stats/personagens:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por personagens (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por personagens
 */
/**
 * @swagger
 * /admin/stats/animes:
 *   get:
 *     tags: [Admin]
 *     summary: Estatisticas por animes (admin)
 *     responses:
 *       200:
 *         description: Estatisticas por animes
 */
adminRouter.use('/mod', ...modGuard, modRouter);
adminRouter.use('/stats', ...adminGuard, estatisticasRouter);

export default adminRouter;
