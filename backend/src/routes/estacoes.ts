import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EstacoesRouter = Router();

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const estacoesPath = path.resolve(
  currentDir,
  '..',
  '..',
  'data',
  'entidades',
  'estacoes.json'
);

type EstacaoItem = {
  id: number;
  nome: string;
};

EstacoesRouter.get('/estacoes', async (_req, res) => {
  try {
    const raw = fs.readFileSync(estacoesPath, 'utf-8');
    const estacoes = JSON.parse(raw) as EstacaoItem[];

    estacoes.sort((a, b) => a.id - b.id);

    res.status(200).json(estacoes);
  } catch (error) {
    console.error('Erro ao listar estações:', error);
    res.status(500).json({ message: 'Erro ao listar estações' });
  }
});

export default EstacoesRouter;
