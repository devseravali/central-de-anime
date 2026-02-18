import express, { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRouter = Router();

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

/**
 * @swagger
 * /upload/capa/{nome}:
 *   get:
 *     summary: Baixar uma imagem de capa específica
 *     description: |
 *       Retorna o arquivo binário da imagem de capa pelo nome do arquivo.
 *       Exemplo de uso: `/upload/capa/nome-da-capa.jpg`
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         description: "Nome do arquivo da capa (ex: capa1.jpg)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem retornada com sucesso
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 */
uploadsRouter.get('/upload/capa/:nome', enviarImagem('../../images/capas'));

/**
 * @swagger
 * /upload/personagem/{nome}:
 *   get:
 *     summary: Baixar uma imagem de personagem específica
 *     description: |
 *       Retorna o arquivo binário da imagem de personagem pelo nome do arquivo.
 *       Exemplo de uso: `/upload/personagem/nome-do-personagem.jpg`
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         description: "Nome do arquivo do personagem (ex: personagem1.jpg)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem retornada com sucesso
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 */
uploadsRouter.get(
  '/upload/personagem/:nome',
  enviarImagem('../../images/personagens'),
);

/**
 * @swagger
 * /upload/capa:
 *   get:
 *     summary: Lista todas as capas disponíveis
 *     tags: [Uploads]
 *     responses:
 *       200:
 *         description: Lista de arquivos de capas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 capas:
 *                   type: array
 *                   items:
 *                     type: string
 */
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

/**
 * @swagger
 * /upload/personagem:
 *   get:
 *     summary: Lista todas as imagens de personagens disponíveis
 *     tags: [Uploads]
 *     responses:
 *       200:
 *         description: Lista de arquivos de personagens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personagens:
 *                   type: array
 *                   items:
 *                     type: string
 */
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

export default uploadsRouter;
