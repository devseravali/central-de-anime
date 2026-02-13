import { Router } from 'express';
import { autenticacao } from '../../middleware/autenticacao';
import {
  autenticarUsuario,
  registrarUsuario,
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  removerUsuario,
  enviarVerificacaoEmail,
  verificarEmail,
  logoutUsuario,
} from '../../controllers/usuariosControlador';

export const usuariosRouter = Router();

/**
 * @swagger
 * /usuarios/register:
 *   post:
 *     tags: [Usuarios]
 *     summary: Registrar usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario criado
 */
usuariosRouter.post('/register', registrarUsuario);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     tags: [Usuarios]
 *     summary: Autenticar usuario
 *     requestBody:
 *       required: true
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
usuariosRouter.post('/login', autenticarUsuario);

/**
 * @swagger
 * /usuarios/{id}/enviar-verificacao:
 *   post:
 *     tags: [Usuarios]
 *     summary: Enviar token de verificacao de email
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Token gerado
 */
usuariosRouter.post('/:id/enviar-verificacao', enviarVerificacaoEmail);

/**
 * @swagger
 * /usuarios/verificar-email:
 *   put:
 *     tags: [Usuarios]
 *     summary: Verificar email do usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verificado
 */
usuariosRouter.put('/verificar-email', verificarEmail);

/**
 * @swagger
 * /usuarios/logout:
 *   post:
 *     tags: [Usuarios]
 *     summary: Logout do usuario
 *     responses:
 *       200:
 *         description: Logout realizado
 */
usuariosRouter.post('/logout', logoutUsuario);

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
usuariosRouter.get('/me', autenticacao, listarUsuarios);

/**
 * @swagger
 * /usuarios/me/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Buscar usuario por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 */
usuariosRouter.get('/me/:id', autenticacao, obterUsuario);

/**
 * @swagger
 * /usuarios/me:
 *   put:
 *     tags: [Usuarios]
 *     summary: Atualizar usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario atualizado
 */
usuariosRouter.put('/me', autenticacao, atualizarUsuario);

/**
 * @swagger
 * /usuarios/me/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Remover usuario por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario removido
 */
usuariosRouter.delete('/me/:id', autenticacao, removerUsuario);
