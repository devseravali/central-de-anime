import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const ProgressosRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

ProgressosRouter.get('/usuarios/:id/progressos', authMiddleware, async (req: Request, res: Response) => {
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

    const progresses = await prisma.watchProgress.findMany({ where: { usuarioId: id }, include: { episodio: { include: { anime: { select: { id: true, nome: true, slug: true } } } } } });

    res.status(200).json(progresses);
  } catch (error) {
    console.error('Erro ao buscar progressos', error);
    res.status(500).json({ message: 'Erro ao buscar progressos' });
  }
});

ProgressosRouter.delete('/usuarios/:id/progressos', authMiddleware, async (req: Request, res: Response) => {
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

    await prisma.watchProgress.deleteMany({ where: { usuarioId: id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar progressos', error);
    res.status(500).json({ message: 'Erro ao deletar progressos' });
  }
});

export default ProgressosRouter;
