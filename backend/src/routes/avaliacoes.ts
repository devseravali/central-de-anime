import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const AvaliacoesRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

AvaliacoesRouter.get('/animes/:id/avaliacoes', async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    const notas = await prisma.notaAnimeUsuario.findMany({
      where: { animeId: id },
      include: { usuario: { select: { id: true, nome: true, avatar: true } } },
    });

    res.status(200).json(notas.map(n => ({ usuario: n.usuario, nota: n.nota })));
  } catch (error) {
    console.error('Erro ao buscar avaliações (anime)', error);
    res.status(500).json({ message: 'Erro ao buscar avaliações' });
  }
});

AvaliacoesRouter.get('/usuarios/:id/avaliacoes', authMiddleware, async (req: Request, res: Response) => {
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

    const notas = await prisma.notaAnimeUsuario.findMany({ where: { usuarioId: id }, include: { anime: { select: { id: true, nome: true, slug: true, capaUrl: true } } } });

    res.status(200).json(notas.map(n => ({ anime: n.anime, nota: n.nota })));
  } catch (error) {
    console.error('Erro ao buscar avaliações (usuario)', error);
    res.status(500).json({ message: 'Erro ao buscar avaliações' });
  }
});

export default AvaliacoesRouter;
