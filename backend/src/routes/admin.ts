import { Router } from 'express';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminController } from '../controllers/adminController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { idParamSchema } from '../schemas/common/idParm.schema';

const AdminRouter = Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os usuários
 *     description: Retorna a lista de usuários. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Administração
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       500:
 *         description: Erro interno do servidor
 */
AdminRouter.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminController.listUsers,
);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   post:
 *     summary: Bane um usuário
 *     description: Bloqueia um usuário da plataforma. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Administração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário que será banido
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuário banido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AdminRouter.post(
  '/users/:id/ban',
  authMiddleware,
  validationMiddleware({ params: idParamSchema }),
  adminMiddleware,
  adminController.banUser,
);

/**
 * @swagger
 * /admin/users/{id}/unban:
 *   post:
 *     summary: Remove o banimento de um usuário
 *     description: Desbloqueia um usuário da plataforma. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Administração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário que será desbloqueado
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Banimento removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AdminRouter.post(
  '/users/:id/unban',
  authMiddleware,
  validationMiddleware({ params: idParamSchema }),
  adminMiddleware,
  adminController.unbanUser,
);

/**
 * @swagger
 * /admin/users/{id}/promote:
 *   post:
 *     summary: Promove um usuário para administrador
 *     description: Concede privilégios administrativos a um usuário. Requer autenticação e privilégios de administrador.
 *     tags:
 *       - Administração
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário que será promovido
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuário promovido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão de administrador
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
AdminRouter.post(
  '/users/:id/promote',
  authMiddleware,
  validationMiddleware({ params: idParamSchema }),
  adminController.promoteUser,
);

export default AdminRouter;