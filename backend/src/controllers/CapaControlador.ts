import { Request, Response } from 'express';
import { salvarCapa } from '../repositories/capaRepositorio';
import { asyncHandler } from '../middleware/errorHandler';
import { capaSchema } from '../schemas/capaSchema';
import { Multer } from 'multer';

export type RequestComArquivo = Request & { 
file ?: Express.Multer.File;
  usuarioId?: number;
};

export const enviarCapa = asyncHandler(
  async (req: RequestComArquivo, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo não enviado' });
    }

    const capaData = {
      nome_original: req.file.originalname,
      nome_salvo: req.file.filename,
      caminho: `/images/capas/${req.file.filename}`,
      mimetype: req.file.mimetype,
    };

    const parseResult = capaSchema.safeParse(capaData);

    if (!parseResult.success) {
      return res.status(400).json({
        erro: 'Dados da capa inválidos',
        detalhes: parseResult.error.format(),
      });
    }

    await salvarCapa({
      nomeOriginal: req.file.originalname,
      nomeSalvo: req.file.filename,
      caminho: capaData.caminho,
      mimetype: req.file.mimetype,
      tamanho: req.file.size,
      usuarioId: req.usuarioId ?? null,
      dataUpload: new Date(),
    });

    return res.status(201).json({
      mensagem: 'Capa enviada com sucesso',
      url: capaData.caminho,
    });
  },
);