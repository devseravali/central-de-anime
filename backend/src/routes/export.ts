import { authMiddleware } from '../middlewares/authMiddleware';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { idParamSchema } from '../schemas/common/idParm.schema';

const ExportRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * @swagger
 * /export/usuarios/{id}:
 *   get:
 *     summary: Exporta os dados de um usuário
 *     description: >
 *       Retorna os dados públicos e de conta do usuário em formato JSON.
 *       O próprio usuário pode acessar seus dados, enquanto administradores
 *       podem exportar os dados de qualquer usuário.
 *       Dados sensíveis, como senha e tokens de recuperação, não são retornados.
 *     tags:
 *       - Exportação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário que será exportado
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Dados do usuário exportados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: Aline Seravali
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: aline@example.com
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.jpg
 *                     status:
 *                       type: string
 *                       example: ATIVO
 *                     criadoEm:
 *                       type: string
 *                       format: date-time
 *                     atualizadoEm:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado. O usuário só pode exportar seus próprios dados, exceto administradores.
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
ExportRouter.get(
  '/export/usuarios/:id',
  authMiddleware,
  validationMiddleware({ params: idParamSchema }),
  async (req: Request, res: Response) => {
    try {
      const id = (req.params as unknown as { id?: number }).id;

      if (typeof id !== 'number') {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      const requesterId = req.user?.id;
      const requesterRole = req.user?.role;

      if (requesterId !== id && requesterRole !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          avatar: true,
          status: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });

      if (!usuario) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      // garantia adicional: remover campos sensíveis caso existam
      const safeUsuario = { ...usuario } as { [key: string]: unknown };
      delete safeUsuario.senha;
      delete safeUsuario.resetSenhaTokenHash;
      delete safeUsuario.resetSenhaExpiraEm;
      delete safeUsuario.sessoes;

      return res.status(200).json({ usuario: safeUsuario });
    } catch (error) {
      console.error('Erro ao exportar usuário', error);
      res.status(500).json({ message: 'Erro ao exportar usuário' });
    }
  }
);

export default ExportRouter;