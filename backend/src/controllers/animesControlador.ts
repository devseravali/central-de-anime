import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { animeServico } from '../services/animesServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
  respostaDeletado,
} from '../helpers/responseHelpers';
import { ErroApi } from '../errors/ErroApi';
import { animeSchema } from '../schemas/animeSchema';

function parseIdParam(idParam: string | undefined): number {
  const id = Number(idParam);
  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw ErroApi.badRequest('ID inválido', 'INVALID_ANIME_ID');
  }
  return id;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const listarTodosAnimes = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 8), 8);
    const offset = (page - 1) * limit;

    const { status, genero, estudio, estacao, ano } = req.query;
    const filtros = {
      status: status ? String(status) : undefined,
      genero: genero ? String(genero) : undefined,
      estudio: estudio ? String(estudio) : undefined,
      estacao: estacao ? String(estacao) : undefined,
      ano: ano ? Number(ano) : undefined,
    };
    const animes = await animeServico.listarTodosAnimes({
      offset,
      limit,
      filtros,
    });
    return respostaLista(res, animes);
  },
);

export const listarNomesAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const nomes = await animeServico.listarNomes();
    return respostaLista(res, nomes);
  },
);

export const buscarAnimePorId = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseIdParam(idParam);
    const anime = await animeServico.buscarPorId(id);
    return respostaSucesso(res, anime);
  },
);

export const criarAnime = asyncHandler(async (req: Request, res: Response) => {
  const animeData = { ...req.body };
  if ('id' in animeData) delete animeData.id;
  if ('anime_id' in animeData) delete animeData.anime_id;

  const parseResult = animeSchema.safeParse(animeData);
  if (!parseResult.success) {
    throw ErroApi.badRequest('Dados inválidos', 'INVALID_ANIME_DATA');
  }

  const novoAnime = await animeServico.criar(parseResult.data);
  return respostaCriado(res, novoAnime, 'Anime criado com sucesso');
});

export const atualizarAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseIdParam(idParam);

    // Validação com Zod
    const animeData = { ...req.body };
    if ('id' in animeData) delete animeData.id;
    if ('anime_id' in animeData) delete animeData.anime_id;

    const parseResult = animeSchema.safeParse(animeData);
    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_ANIME_DATA');
    }

    const animeAtualizado = await animeServico.atualizar(id, parseResult.data);
    return respostaAtualizado(
      res,
      animeAtualizado,
      'Anime atualizado com sucesso',
    );
  },
);

export const deletarAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseIdParam(idParam);
    await animeServico.deletar(id);
    return respostaDeletado(res, 'Anime removido com sucesso');
  },
);

export const listarAnimesPorTemporada = asyncHandler(
  async (_req: Request, res: Response) => {
    const agrupado = await animeServico.listarAnimesPorTemporada();
    return respostaSucesso(res, agrupado);
  },
);

export const listarQuantidadePorTemporada = asyncHandler(
  async (_req: Request, res: Response) => {
    const resultado = await animeServico.listarQuantidadePorTemporada();
    return respostaLista(res, resultado);
  },
);

export const listarAnosAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const anos = await animeServico.listarAnosAnimes();
    return respostaLista(res, anos);
  },
);
