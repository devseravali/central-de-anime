import { Request, Response } from 'express';
import { salvarCapa } from '../repositories/uploadsRepositorio';

export const uploadCapaControlador = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado' });

  await salvarCapa({
    nomeOriginal: req.file.originalname,
    nomeSalvo: req.file.filename,
    caminho: `/images/capas/${req.file.filename}`,
    mimetype: req.file.mimetype,
    tamanho: req.file.size,
    usuarioId: req.usuario?.id ? Number(req.usuario.id) : null,
    dataUpload: new Date(),
  });

  res.json({ url: `/images/capas/${req.file.filename}` });
};
