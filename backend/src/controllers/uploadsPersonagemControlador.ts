import { Request, Response } from 'express';
import { salvarPersonagem } from '../repositories/uploadsRepositorio';

export const uploadPersonagemControlador = async (
  req: Request,
  res: Response,
) => {
  if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado' });

  await salvarPersonagem({
    nomeOriginal: req.file.originalname,
    nomeSalvo: req.file.filename,
    caminho: `/images/personagens/${req.file.filename}`,
    mimetype: req.file.mimetype,
    tamanho: req.file.size,
    usuarioId: req.usuario?.id ?? null,
    dataUpload: new Date(),
  });

  res.json({ url: `/images/personagens/${req.file.filename}` });
};
