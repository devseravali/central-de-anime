import { Router } from 'express';
import { prisma } from '../config/prisma';

const EstudiosRouter = Router();

EstudiosRouter.get('/estudios', async (_req, res) => {
  try {
    const estudios = await prisma.estudio.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json(estudios);
  } catch (error) {
    console.error('Erro ao listar estúdios:', error);
    res.status(500).json({ message: 'Erro ao listar estúdios' });
  }
});

export default EstudiosRouter;
