import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const ExportRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

ExportRouter.get('/export/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json({ usuario });
  } catch (error) {
    console.error('Erro ao exportar usuário', error);
    res.status(500).json({ message: 'Erro ao exportar usuário' });
  }
});

export default ExportRouter;
