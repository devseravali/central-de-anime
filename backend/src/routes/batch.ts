import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const BatchRouter = Router();

BatchRouter.post('/animes/batch', async (req: Request, res: Response) => {
  try {
    const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n)) : [];

    if (ids.length === 0) {
      res.status(400).json({ message: 'ids é obrigatório (array de números)' });
      return;
    }

    const animes = await prisma.anime.findMany({ where: { id: { in: ids } }, select: { id: true, nome: true, slug: true } });

    res.status(200).json({ animesFound: animes.length, animes });
  } catch (error) {
    console.error('Erro no batch de animes', error);
    res.status(500).json({ message: 'Erro no batch' });
  }
});

export default BatchRouter;
