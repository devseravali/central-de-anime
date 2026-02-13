import { Router } from 'express';
import {
  aprovarConteudo,
  banirUsuario,
  listarSancoes,
  listarSancoesUsuario,
  rejeitarConteudo,
  removerConteudo,
  reativarUsuario,
  suspenderUsuario,
} from '../../controllers/adminModeracaoControlador';

const modRouter = Router();

/**
 * @swagger
 * /admin/mod/sancoes:
 *   get:
 *     tags: [Admin]
 *     summary: Listar sancoes
 *     responses:
 *       200:
 *         description: Lista de sancoes
 */
modRouter.get('/sancoes', listarSancoes);

/**
 * @swagger
 * /admin/mod/usuarios/{id}/sancoes:
 *   get:
 *     tags: [Admin]
 *     summary: Listar sancoes do usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de sancoes do usuario
 */
modRouter.get('/usuarios/:id/sancoes', listarSancoesUsuario);

/**
 * @swagger
 * /admin/mod/usuarios/{id}/suspender:
 *   post:
 *     tags: [Admin]
 *     summary: Suspender usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario suspenso
 */
modRouter.post('/usuarios/:id/suspender', suspenderUsuario);

/**
 * @swagger
 * /admin/mod/usuarios/{id}/banir:
 *   post:
 *     tags: [Admin]
 *     summary: Banir usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario banido
 */
modRouter.post('/usuarios/:id/banir', banirUsuario);

/**
 * @swagger
 * /admin/mod/usuarios/{id}/reativar:
 *   post:
 *     tags: [Admin]
 *     summary: Reativar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario reativado
 */
modRouter.post('/usuarios/:id/reativar', reativarUsuario);

/**
 * @swagger
 * /admin/mod/conteudo/aprovar:
 *   post:
 *     tags: [Admin]
 *     summary: Aprovar conteudo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Conteudo aprovado
 */
modRouter.post('/conteudo/aprovar', aprovarConteudo);

/**
 * @swagger
 * /admin/mod/conteudo/rejeitar:
 *   post:
 *     tags: [Admin]
 *     summary: Rejeitar conteudo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Conteudo rejeitado
 */
modRouter.post('/conteudo/rejeitar', rejeitarConteudo);

/**
 * @swagger
 * /admin/mod/conteudo/remover:
 *   post:
 *     tags: [Admin]
 *     summary: Remover conteudo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Conteudo removido
 */
modRouter.post('/conteudo/remover', removerConteudo);

export { modRouter };
