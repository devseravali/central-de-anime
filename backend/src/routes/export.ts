import { authMiddleware } from '../middlewares/authMiddleware';
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const ExportRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

ExportRouter.get('/export/usuarios/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === undefined) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      const requesterId = req.user?.id;
      const requesterRole = req.user?.role;

      if (requesterId !== id && requesterRole !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          avatar: true,
          status: true,
          criadoEm: true,
          atualizadoEm: true,
        }
      });

      if (!usuario) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      // garantia adicional: remover campos sensíveis caso existam
      const safeUsuario = { ...usuario } as any;
      delete safeUsuario.senha;
      delete safeUsuario.resetSenhaTokenHash;
      delete safeUsuario.resetSenhaExpiraEm;
      delete safeUsuario.sessoes;

      return res.status(200).json({ usuario: safeUsuario });
    } catch (error) {
      console.error('Erro ao exportar usuário', error);
      res.status(500).json({ message: 'Erro ao exportar usuário' });
    }
  }
);

export default ExportRouter;