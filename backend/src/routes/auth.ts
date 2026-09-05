import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import {
    loginRateLimiter,
    registerRateLimiter,
    forgotRateLimiter,
} from '../middlewares/rateLimiter';
import {
    registerSchema,
    loginSchema,
    refreshSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    logoutSchema,
} from '../schemas/auth/auth.schemas';

const AuthRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria uma nova conta de usuário.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Aline Seravali
 *               email:
 *                 type: string
 *                 format: email
 *                 example: aline@example.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados de cadastro inválidos
 *       409:
 *         description: Usuário já cadastrado
 *       429:
 *         description: Muitas tentativas de cadastro
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/register',
    registerRateLimiter,
    validationMiddleware({ body: registerSchema }),
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login
 *     description: Autentica um usuário utilizando email e senha.
 *     tags:
 *       - Autenticação
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
 *                 example: aline@example.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados de login inválidos
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/login',
    loginRateLimiter,
    validationMiddleware({ body: loginSchema }),
    authController.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualiza os tokens de autenticação
 *     description: Gera um novo token de acesso utilizando um refresh token válido.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       400:
 *         description: Refresh token inválido
 *       401:
 *         description: Refresh token não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/refresh',
    validationMiddleware({ body: refreshSchema }),
    authController.refresh
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita recuperação de senha
 *     description: Envia uma solicitação para recuperação da senha do usuário.
 *     tags:
 *       - Autenticação
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
 *                 example: aline@example.com
 *     responses:
 *       200:
 *         description: Solicitação de recuperação processada
 *       400:
 *         description: Email inválido
 *       429:
 *         description: Muitas solicitações de recuperação
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/forgot-password',
    forgotRateLimiter,
    validationMiddleware({ body: forgotPasswordSchema }),
    authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha
 *     description: Define uma nova senha utilizando o token de recuperação.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: token-de-recuperacao
 *               novaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Dados inválidos ou token inválido
 *       401:
 *         description: Token não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/reset-password',
    validationMiddleware({ body: resetPasswordSchema }),
    authController.resetPassword
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza logout
 *     description: Encerra a sessão ou invalida o refresh token do usuário.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
AuthRouter.post(
    '/logout',
    validationMiddleware({ body: logoutSchema }),
    authController.logout
);

export default AuthRouter;