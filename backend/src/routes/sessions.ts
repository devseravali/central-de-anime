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

SessionsRouter.get('/auth/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.query.usuarioId ? parseId(req.query.usuarioId) : undefined;

    if (usuarioId === undefined) {
      res.status(400).json({ message: 'usuarioId é obrigatório como query param' });
      return;
    }

    // allow only owner or admin
    if (req.user?.id !== usuarioId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    const sessoes = await prisma.sessao.findMany({ where: { usuarioId }, orderBy: { id: 'desc' } });

    res.status(200).json(sessoes);
  } catch (error) {
    console.error('Erro ao listar sessões', error);
    res.status(500).json({ message: 'Erro ao listar sessões' });
  }
});

SessionsRouter.delete('/auth/sessions/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = parseId(req.params.sessionId);

    if (sessionId === undefined) {
      res.status(400).json({ message: 'sessionId inválido' });
      return;
    }

    const sessao = await prisma.sessao.findUnique({ where: { id: sessionId } });

    if (!sessao) {
      res.status(404).json({ message: 'Sessão não encontrada' });
      return;
    }

    if (req.user?.id !== sessao.usuarioId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    await prisma.sessao.updateMany({ where: { id: sessionId, revogadoEm: null }, data: { revogadoEm: new Date() } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao revogar sessão', error);
    res.status(500).json({ message: 'Erro ao revogar sessão' });
  }
});

export default SessionsRouter;
