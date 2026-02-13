import { Router } from 'express';
import {
  solicitarVerificacaoEmail,
  verificarEmail,
} from '../controllers/verificacoesEmailControlador';
import { email } from 'zod';

const emailRouter = Router();

/**
 * @swagger
 * /email/solicitar:
 *   post:
 *     tags: [Email]
 *     summary: Solicitar verificação de email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitação enviada
 */
import { autenticacao } from '../middleware/autenticacao';
emailRouter.post('/solicitar', autenticacao, solicitarVerificacaoEmail);

/**
 * @swagger
 * /email/verificar:
 *   get:
 *     tags: [Email]
 *     summary: Verificar email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado
 */
emailRouter.get('/verificar', verificarEmail);

/**
 * @swagger
 * /email/teste:
 *   get:
 *     tags: [Email]
 *     summary: Testar verificação de email
 *     responses:
 *       200:
 *         description: Teste de verificação
 */
emailRouter.get('/teste', verificarEmail);

export { emailRouter };
