import { Router, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const ProgressosRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;

  const n = Number.parseInt(value, 10);

  return Number.isNaN(n) ? undefined : n;
}

/**
 * @swagger
 * /usuarios/{id}/progressos:
 *   get:
 *     summary: Lista o progresso de episódios de um usuário
 *     description: >
 *       Retorna todos os registros de progresso de episódios do usuário.
 *       O próprio usuário pode consultar seus progressos e administradores
 *       podem consultar os progressos de qualquer usuário.
 *     tags:
 *       - Progressos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Progressos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Registro de progresso de um episódio
 *                 properties:
 *                   episodio:
 *                     type: object
 *                     description: Episódio relacionado ao progresso
 *                     properties:
 *                       anime:
 *                         type: object
 *                         description: Anime relacionado ao episódio
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           titulo:
 *                             type: string
 *                             example: Naruto
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
ProgressosRouter.get(
  '/usuarios/:id/progressos',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === undefined) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const progresses = await prisma.watchProgress.findMany({
        where: {
          usuarioId: id,
        },
        include: {
          episodio: {
            include: {
              anime: {
                select: {
                  id: true,
                  titulo: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(progresses);
    } catch (error) {
      console.error('Erro ao buscar progressos', error);

      res.status(500).json({
        message: 'Erro ao buscar progressos',
      });
    }
  }
);

/**
 * @swagger
 * /usuarios/{id}/progressos:
 *   delete:
 *     summary: Remove todos os progressos de um usuário
 *     description: >
 *       Remove todos os registros de progresso de episódios associados ao usuário.
 *       O próprio usuário pode remover seus progressos e administradores podem
 *       remover os progressos de qualquer usuário.
 *     tags:
 *       - Progressos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Progressos removidos com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
ProgressosRouter.delete(
  '/usuarios/:id/progressos',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === undefined) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      await prisma.watchProgress.deleteMany({
        where: {
          usuarioId: id,
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar progressos', error);

      res.status(500).json({
        message: 'Erro ao deletar progressos',
      });
    }
  }
);

export default ProgressosRouter;