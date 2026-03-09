import { Router } from 'express';
import {
  solicitarVerificacaoEmail,
  verificarEmail,
} from '../controllers/verificacoesEmailControlador';

export const emailRouter = Router();

/**
 * @swagger
 * /email/solicitar:
 *   post:
 *     tags: [Email]
 *     summary: Solicita verificação de e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: E-mail de verificação enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /email/verificar:
 *   get:
 *     tags: [Email]
 *     summary: Verifica e-mail do usuário
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E-mail verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */

emailRouter.post('/solicitar', solicitarVerificacaoEmail);
emailRouter.get('/verificar', verificarEmail);