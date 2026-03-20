import express, { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRouter = Router();
/**
 * @swagger
 * /upload/capa/{nome}:
 *   get:
 *     tags: [Uploads]
 *     summary: Retorna imagem de capa pelo nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem de capa
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 * /upload/personagem/{nome}:
 *   get:
 *     tags: [Uploads]
 *     summary: Retorna imagem de personagem pelo nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem de personagem
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 * /upload/capa:
 *   get:
 *     tags: [Uploads]
 *     summary: Lista todos os arquivos de capa
 *     responses:
 *       200:
 *         description: Lista de arquivos de capa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 capas:
 *                   type: array
 *                   items:
 *                     type: string
 * /upload/personagem:
 *   get:
 *     tags: [Uploads]
 *     summary: Lista todos os arquivos de personagem
 *     responses:
 *       200:
 *         description: Lista de arquivos de personagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personagens:
 *                   type: array
 *                   items:
 *                     type: string
 * /avatars/{nome}:
 *   get:
 *     tags: [Uploads]
 *     summary: Retorna avatar pelo nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Avatar não encontrado
 */

uploadsRouter.use(
  '/images',
  express.static(path.resolve(__dirname, '../../images')),
);

const enviarImagem = (pasta: string) => {
  return (req: Request, res: Response) => {
    try {
      const nomeArquivo = Array.isArray(req.params.nome)
        ? req.params.nome[0]
        : req.params.nome;
      const file = path.resolve(__dirname, pasta, nomeArquivo);

      fs.access(file, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('Arquivo não encontrado:', file);
          return res.status(404).json({
            sucesso: false,
            dados: null,
            erro: {
              mensagem: 'Imagem não encontrada',
              codigo: 'IMAGEM_NAO_ENCONTRADA',
              timestamp: new Date().toISOString(),
            },
          });
        }

        res.sendFile(file, (errSend) => {
          if (errSend) {
            console.error('Erro ao enviar arquivo:', errSend);
            return res.status(500).json({
              sucesso: false,
              dados: null,
              erro: {
                mensagem: 'Erro ao enviar a imagem',
                codigo: 'UPLOAD_ERRO',
                timestamp: new Date().toISOString(),
              },
            });
          }
        });
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({
        sucesso: false,
        dados: null,
        erro: {
          mensagem: 'Erro interno ao buscar imagem',
          codigo: 'BUSCA_IMAGEM_ERRO',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

uploadsRouter.get('/upload/capa/:nome', enviarImagem('../../images/capas'));
uploadsRouter.get(
  '/upload/personagem/:nome',
  enviarImagem('../../images/personagens'),
);
uploadsRouter.get('/upload/capa', (req: Request, res: Response) => {
  const dir = path.resolve(__dirname, '../../images/capas');

  fs.readdir(dir, (err, files) => {
    if (err)
      return res.status(500).json({
        sucesso: false,
        dados: null,
        erro: {
          mensagem: 'Não foi possível ler a pasta',
          codigo: 'LEITURA_PASTA_ERRO',
          timestamp: new Date().toISOString(),
        },
      });

    res.json({ capas: files });
  });
});

uploadsRouter.get('/upload/personagem', (req: Request, res: Response) => {
  const dir = path.resolve(__dirname, '../../images/personagens');

  fs.readdir(dir, (err, files) => {
    if (err)
      return res.status(500).json({
        sucesso: false,
        dados: null,
        erro: {
          mensagem: 'Não foi possível ler a pasta',
          codigo: 'LEITURA_PASTA_ERRO',
          timestamp: new Date().toISOString(),
        },
      });

    res.json({ personagens: files });
  });
});

uploadsRouter.get('/avatars/:nome', (req: Request, res: Response) => {
  const nomeArquivo = Array.isArray(req.params.nome)
    ? req.params.nome[0]
    : req.params.nome;
  const file = path.resolve(__dirname, '../../images/avatars', nomeArquivo);

  fs.access(file, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        sucesso: false,
        dados: null,
        erro: {
          mensagem: 'Avatar não encontrado',
          codigo: 'AVATAR_NAO_ENCONTRADO',
          timestamp: new Date().toISOString(),
        },
      });
    }
    res.sendFile(file);
  });
});
