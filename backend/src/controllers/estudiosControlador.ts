import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { estudiosServico } from '../services/estudiosServico';
import { ErroApi } from '../errors/ErroApi';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import { estudiosSchema } from '../schemas/estudiosSchema';

function parsePositiveInt(value: unknown, errorCode: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw ErroApi.badRequest('ID inválido', errorCode);
  }
  return parsed;
}

export const listarEstudios = asyncHandler(
  async (_req: Request, res: Response) => {
    const estudios = await estudiosServico.listar();
    return respostaLista(res, estudios);
  },
);

export const buscarEstudioPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id, 'INVALID_ESTUDIO_ID');
    const estudio = await estudiosServico.buscarPorId(id);

    if (!estudio) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaSucesso(res, estudio);
  },
);

export const buscarEstudioPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nomeParam = req.params.nome;
    const nome = Array.isArray(nomeParam) ? nomeParam[0] : nomeParam;

    if (!nome) {
      throw ErroApi.badRequest('Nome inválido', 'INVALID_ESTUDIO_NAME');
    }

    const estudio = await estudiosServico.buscarPorNome(nome);

    if (!estudio) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaSucesso(res, estudio);
  },
);

export const listarAnimesPorEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id, 'INVALID_ESTUDIO_ID');

    const animes = await estudiosServico.listarAnimes(id);

    if (!animes.length) {
      throw ErroApi.notFound('Estúdio sem animes', 'NO_ANIMES_FOR_ESTUDIO');
    }

    return respostaLista(res, animes);
  },
);

export const criarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = estudiosSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest(
        'Dados inválidos para estúdio',
        'INVALID_ESTUDIO_DATA',
      );
    }

    const estudio = await estudiosServico.criar(parseResult.data);

    return respostaCriado(res, estudio, 'Estúdio criado com sucesso');
  },
);

export const atualizarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id, 'INVALID_ESTUDIO_ID');

    const parseResult = estudiosSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest(
        'Dados inválidos para estúdio',
        'INVALID_ESTUDIO_DATA',
      );
    }

    const estudio = await estudiosServico.atualizar(id, parseResult.data);

    if (!estudio) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaAtualizado(res, estudio, 'Estúdio atualizado com sucesso');
  },
);

export const deletarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id, 'INVALID_ESTUDIO_ID');

    try {
      await estudiosServico.deletar(id);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Estúdio removido com sucesso',
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('ESTUDIO_NAO_ENCONTRADO')
      ) {
        throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
      }

      throw error;
    }
  },
);