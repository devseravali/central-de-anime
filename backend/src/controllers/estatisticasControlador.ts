export const obterEstatisticasTemporadas = asyncHandler(
  async (req: Request, res: Response) => {
    const ano = req.query.ano ? String(req.query.ano) : undefined;
    const dados = await estatisticasServico.obterEstatisticasTemporadas(ano);
    return respostaSucesso(res, dados);
  },
);
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { estatisticasServico } from '../services/estatisticasServico';
import { respostaSucesso } from '../helpers/responseHelpers';

export const obterEstatisticasStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasStatus();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticas = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticas();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasSimples = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticas();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasGeneros = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasGeneros();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasEstudios = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasEstudios();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasPlataformas = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasPlataformas();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasTags();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasPopulares = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const dados = await estatisticasServico.obterEstatisticasTags();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasEstacoes();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasPersonagens = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasPersonagens();
    return respostaSucesso(res, dados);
  },
);

export const obterEstatisticasAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const dados = await estatisticasServico.obterEstatisticasAnimes();
    return respostaSucesso(res, dados);
  },
);
