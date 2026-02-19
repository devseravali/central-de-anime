import { Router } from 'express';
import { estatisticasRouter } from '../estatisticasRouter';
import { modRouter } from './modRouter';

const adminRouter = Router();

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
 *     summary: Login de admin
 *     description: |
 *       Envie JSON com email e senha para login de admin.
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
 *         description: Login realizado
 */

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     tags: [Admin]
 *     summary: Login de admin (alias)
 *     description: |
 *       Envie JSON com email e senha para login de admin.
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
 *         description: Login realizado
 */

adminRouter.use('/mod', modRouter);
adminRouter.use('/stats', estatisticasRouter);

export default adminRouter;
