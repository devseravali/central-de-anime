import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const FavoritosRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

FavoritosRouter.get('/usuarios/:id/favoritos/animes', async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    const favs = await prisma.usuarioFavoritoAnime.findMany({
      where: { usuarioId: id },
      include: { anime: { select: { id: true, nome: true, slug: true, capaUrl: true } } },
    });

    res.status(200).json(favs.map(f => f.anime));
  } catch (error) {
    console.error('Erro ao buscar favoritos (animes)', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos' });
  }
});

FavoritosRouter.get('/usuarios/:id/favoritos/personagens', async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    const favs = await prisma.personagemFavorito.findMany({
      where: { usuarioId: id },
      include: { personagem: true },
    });

    res.status(200).json(favs.map(f => f.personagem));
  } catch (error) {
    console.error('Erro ao buscar favoritos (personagens)', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos' });
  }
});

export default FavoritosRouter;
