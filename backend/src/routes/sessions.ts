import { Router, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const SessionsRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;

  const n = Number.parseInt(value, 10);

  return Number.isNaN(n) ? undefined : n;
}

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Lista as sessões de um usuário
 *     description: >
 *       Retorna as sessões autenticadas de um usuário.
 *       O próprio usuário pode consultar suas sessões e administradores
 *       podem consultar as sessões de qualquer usuário.
 *     tags:
 *       - Sessões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário cujas sessões serão consultadas
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sessões listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Dados da sessão
 *       400:
 *         description: usuarioId não informado ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: usuarioId é obrigatório como query param
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
SessionsRouter.get(
  '/auth/sessions',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const usuarioId = req.query.usuarioId
        ? parseId(req.query.usuarioId)
        : undefined;

      if (usuarioId === undefined) {
        res.status(400).json({
          message: 'usuarioId é obrigatório como query param',
        });

        return;
      }

      if (
        req.user?.id !== usuarioId &&
        req.user?.role !== 'ADMIN'
      ) {
        res.status(403).json({
          message: 'Acesso negado',
        });

        return;
      }

      const sessoes = await prisma.sessao.findMany({
        where: {
          usuarioId,
        },
        orderBy: {
          id: 'desc',
        },
      });

      res.status(200).json({
        message: 'OK',
        sessions: sessoes,
      });
    } catch (error) {
      console.error('Erro ao listar sessões', error);

      res.status(500).json({
        message: 'Erro ao listar sessões',
      });
    }
  }
);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoga uma sessão
 *     description: >
 *       Revoga uma sessão específica de um usuário.
 *       O próprio usuário pode revogar suas sessões e administradores
 *       podem revogar sessões de qualquer usuário.
 *     tags:
 *       - Sessões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID da sessão que será revogada
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Sessão revogada com sucesso
 *       400:
 *         description: sessionId inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: sessionId inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sessão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
SessionsRouter.delete(
  '/auth/sessions/:sessionId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const sessionId = parseId(req.params.sessionId);

      if (sessionId === undefined) {
        res.status(400).json({
          message: 'sessionId inválido',
        });

        return;
      }

      const sessao = await prisma.sessao.findUnique({
        where: {
          id: sessionId,
        },
      });

      if (!sessao) {
        res.status(404).json({
          message: 'Sessão não encontrada',
        });

        return;
      }

      if (
        req.user?.id !== sessao.usuarioId &&
        req.user?.role !== 'ADMIN'
      ) {
        res.status(403).json({
          message: 'Acesso negado',
        });

        return;
      }

      await prisma.sessao.updateMany({
        where: {
          id: sessionId,
          revogadoEm: null,
        },
        data: {
          revogadoEm: new Date(),
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao revogar sessão', error);

      res.status(500).json({
        message: 'Erro ao revogar sessão',
      });
    }
  }
);

export default SessionsRouter;
