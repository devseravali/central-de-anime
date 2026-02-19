/**
 * @swagger
 * /sessoes/validate:
 *   get:
 *     tags: [Sessoes]
 *     summary: Validar sessão do usuário autenticado

 *     responses:
 *       200:
 *         description: Sessão válida
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /sessoes/create:
 *   post:
 *     tags: [Sessoes]
 *     summary: Criar nova sessão para o usuário autenticado

 *     responses:
 *       200:
 *         description: Sessão criada
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /sessoes/logout:
 *   post:
 *     tags: [Sessoes]
 *     summary: Encerrar sessão ativa do usuário autenticado

 *     responses:
 *       200:
 *         description: Sessão encerrada
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /sessoes/logout-all:
 *   post:
 *     tags: [Sessoes]
 *     summary: Encerrar todas as sessões do usuário autenticado

 *     responses:
 *       200:
 *         description: Todas as sessões encerradas
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /sessoes/auth/google:
 *   get:
 *     tags: [Sessoes]
 *     summary: Iniciar autenticação Google OAuth2
 *     responses:
 *       302:
 *         description: Redirecionamento para Google
 */

/**
 * @swagger
 * /sessoes/auth/google/callback:
 *   get:
 *     tags: [Sessoes]
 *     summary: Callback do Google OAuth2
 *     responses:
 *       200:
 *         description: Usuário autenticado com sucesso
 *       302:
 *         description: Redirecionamento em caso de falha
 */
import { Router } from 'express';
import passport from 'passport';
import {
  criarSessao,
  encerrarSessaoAtiva,
  encerrarTodasSessoes,
  validarSessao,
} from '../../controllers/sessoesControlador';

const sessoesRouter = Router();

sessoesRouter.get('/validate', validarSessao);

sessoesRouter.post('/create', criarSessao);

sessoesRouter.post('/logout', encerrarSessaoAtiva);

sessoesRouter.post('/logout-all', encerrarTodasSessoes);

sessoesRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

sessoesRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.json({ sucesso: true, usuario: req.user });
  },
);
