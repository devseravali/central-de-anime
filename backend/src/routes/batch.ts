import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { animeService } from '../services/animeService';

const BatchRouter = Router();

BatchRouter.post('/animes/batch', async (req: Request, res: Response) => {
  try {
    // If the client posted a single anime object, normalize to array
    let payload: any[];

    if (Array.isArray(req.body)) {
      payload = req.body;
    } else if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      payload = [req.body];
    } else {
      // Backwards-compatible: accept { ids: [...] }
      const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n)) : [];

      if (ids.length === 0) {
        res.status(400).json({ message: 'Envie um array de animes ou { ids: [...] }' });
        return;
      }

      const animes = await prisma.anime.findMany({ where: { id: { in: ids } }, select: { id: true, nome: true, slug: true } });

      res.status(200).json({ animesFound: animes.length, animes });
      return;
    }

    // call service batch upsert
    if (typeof animeService.batchUpsertAnimes !== 'function') {
      res.status(500).json({ message: 'Serviço de batch não disponível' });
      return;
    }

    const result = await animeService.batchUpsertAnimes(payload);

    res.status(200).json(result);
  } catch (error) {
    console.error('Erro no batch de animes', error);
    res.status(500).json({ message: 'Erro no batch' });
  }
});

export default BatchRouter;
