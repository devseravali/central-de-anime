import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { dadosServico } from '../services/dadosServico';
import { respostaLista, respostaSucesso } from '../helpers/responseHelpers';

export const listarDados = asyncHandler(
  async (_req: Request, res: Response) => {
    const [generos, plataformas, status, tags, temporadas, estudios, estacoes] =
      await Promise.all([
        dadosServico.listarGeneros(),
        dadosServico.listarPlataformas(),
        dadosServico.listarStatus(),
        dadosServico.listarTags(),
        dadosServico.listarTemporadas(),
        dadosServico.listarEstudios(),
        dadosServico.listarEstacoes(),
      ]);

    return respostaSucesso(res, {
      generos,
      plataformas,
      status,
      tags,
      temporadas,
      estudios,
      estacoes,
    });
  },
);

export const listarGeneros = asyncHandler(
  async (_req: Request, res: Response) => {
    const generos = await dadosServico.listarGeneros();
    return respostaLista(res, generos);
  },
);

export const listarPlataformas = asyncHandler(
  async (_req: Request, res: Response) => {
    const plataformas = await dadosServico.listarPlataformas();
    return respostaLista(res, plataformas);
  },
);

export const listarStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const status = await dadosServico.listarStatus();
    return respostaLista(res, status);
  },
);

export const listarTags = asyncHandler(async (_req: Request, res: Response) => {
  const tags = await dadosServico.listarTags();
  return respostaLista(res, tags);
});

export const listarTemporadas = asyncHandler(
  async (_req: Request, res: Response) => {
    const temporadas = await dadosServico.listarTemporadas();
    return respostaLista(res, temporadas);
  },
);

export const listarEstudios = asyncHandler(
  async (_req: Request, res: Response) => {
    const estudios = await dadosServico.listarEstudios();
    return respostaLista(res, estudios);
  },
);

export const listarEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const estacoes = await dadosServico.listarEstacoes();
    return respostaLista(res, estacoes);
  },
);

export const listarAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await dadosServico.listarAnimes();
    return respostaLista(res, animes);
  },
);

export const listarPersonagens = asyncHandler(
  async (_req: Request, res: Response) => {
    const personagens = await dadosServico.listarPersonagens();
    return respostaLista(res, personagens);
  },
);

export const buscarPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const entidadeParam = req.params.entidade;
    const nomeParam = req.params.nome;

    const entidade = Array.isArray(entidadeParam)
      ? entidadeParam[0]
      : entidadeParam;

    const nome = Array.isArray(nomeParam) ? nomeParam[0] : nomeParam;

    const resultadoBusca = await dadosServico.buscarPorNome(entidade, nome);
    return respostaSucesso(res, resultadoBusca);
  },
);
