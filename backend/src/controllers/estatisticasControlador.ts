import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { respostaSucesso } from '../helpers/responseHelpers';
import { estatisticasServico } from '../services/estatisticasServico';
import { z } from 'zod';

export const obterEstatisticasUsuarios = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasUsuarios();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasTemporadas = asyncHandler(
  async (req: Request, res: Response) => {
    const anoSchema = z
      .string()
      .regex(/^\d{4}$/)
      .transform(Number)
      .optional();

    let ano: number | undefined = undefined;

    if (req.query.ano !== undefined) {
      const parseResult = anoSchema.safeParse(req.query.ano);

      if (!parseResult.success) {
        return res.status(400).json({
          erro: 'Ano inválido',
          detalhes: parseResult.error.format(),
        });
      }

      ano = parseResult.data;
    }

    const temporadas =
      await estatisticasServico.obterEstatisticasTemporadas(ano);

    return respostaSucesso(res, temporadas);
  },
);

export const obterEstatisticasPopulares = asyncHandler(
  async (req: Request, res: Response) => {
    const limitSchema = z
      .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
      .refine((val) => typeof val === 'number' && val > 0 && val <= 50, {
        message: 'O limite deve ser entre 1 e 50',
      });

    let limit: number = 5;

    if (req.query.limit !== undefined) {
      const parseResult = limitSchema.safeParse(req.query.limit);
      if (!parseResult.success) {
        return res.status(400).json({
          erro: 'Limite inválido',
          detalhes: parseResult.error.format(),
        });
      }
      limit = parseResult.data;
    }

    const populares =
      await estatisticasServico.obterEstatisticasPopulares(limit);
    return respostaSucesso(res, populares);
  },
);

export const obterEstatisticas = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticas();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasSimples = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasSimples();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasGeneros = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasGeneros();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasEstudios = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasEstudios();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasPlataformas = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasPlataformas();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasStatus();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasTags();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasEstacoes();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasPersonagens = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasPersonagens();
    return respostaSucesso(res, stats);
  },
);

export const obterEstatisticasAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await estatisticasServico.obterEstatisticasAnimes();
    return respostaSucesso(res, stats);
  },
);
