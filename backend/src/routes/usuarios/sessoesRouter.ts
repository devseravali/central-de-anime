import { Router } from 'express';
import passport from 'passport';
import {
  criarSessao,
  encerrarSessaoAtiva,
  encerrarTodasSessoes,
  validarSessao,
} from '../../controllers/sessoesControlador';
import { autenticacaoJWT } from '../../middleware/autenticacaoJWT';

export const sessoesRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Sessões
 *     description: Autenticação e gerenciamento de sessões
 *
 * /sessoes/validate:
 *   get:
 *     tags: [Sessões]
 *     summary: Valida sessão atual
 *     responses:
 *       200:
 *         description: Sessão válida
 *
 * /sessoes/create:
 *   post:
 *     tags: [Sessões]
 *     summary: Cria uma sessão (login)
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
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sessão criada com sucesso
 *       401:
 *         description: Credenciais inválidas
 *
 * /sessoes/logout:
 *   post:
 *     tags: [Sessões]
 *     summary: Encerra sessão ativa
 *     responses:
 *       200:
 *         description: Sessão encerrada
 *       401:
 *         description: Não autenticado
 *
 * /sessoes/logout-all:
 *   post:
 *     tags: [Sessões]
 *     summary: Encerra todas as sessões do usuário
 *     responses:
 *       200:
 *         description: Todas as sessões encerradas
 *       401:
 *         description: Não autenticado
 *
 */

sessoesRouter.get('/validate', validarSessao);
sessoesRouter.post('/create', criarSessao);
sessoesRouter.post('/logout', autenticacaoJWT, encerrarSessaoAtiva);
sessoesRouter.post('/logout-all', autenticacaoJWT, encerrarTodasSessoes);
