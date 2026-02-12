import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { estudiosServico } from '../services/estudiosServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';

import {
  estudioCriacaoDTO,
  estudioAtualizacaoDTO,
} from '../types/dtos/estudioDTO';
import { db } from '../db';
import { estudios } from '../schema/estudios';

const isErrorWithCode = (err: unknown): err is Error & { code: string } =>
  err instanceof Error &&
  'code' in err &&
  typeof (err as { code?: unknown }).code === 'string';

export const listarEstudios = asyncHandler(
  async (req: Request, res: Response) => {
    const pagina = parseInt(String(req.query.pagina ?? 1), 10);
    const limite = parseInt(String(req.query.limite ?? 20), 10);
    const estudios = await estudiosServico.listar({ pagina, limite });
    return respostaLista(res, estudios);
  },
);

export const buscarTodosEstudios = listarEstudios;

export const buscarEstudioPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTUDIO_ID');
    }

    const estudio = await estudiosServico.buscarPorId(id);
    if (!estudio) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaSucesso(res, estudio);
  },
);

export const buscarEstudioPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const { nome } = req.params;

    const nomeString = Array.isArray(nome) ? nome[0] : nome;

    if (!nomeString) {
      throw ErroApi.badRequest('Nome inválido', 'INVALID_ESTUDIO_NAME');
    }

    const estudio = await estudiosServico.buscarPorNome(nomeString);
    if (!estudio) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    const animes = await estudiosServico.listarAnimes(estudio.id);
    if (!animes.length) {
      throw ErroApi.notFound(
        'Estúdio sem animes cadastrados',
        'NO_ANIMES_FOR_ESTUDIO',
      );
    }

    return respostaLista(res, animes);
  },
);

export const listarAnimesPorNomeEstudio = buscarEstudioPorNome;

export const listarAnimesPorEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTUDIO_ID');
    }

    const animes = await estudiosServico.listarAnimes(id);
    if (!animes.length) {
      throw ErroApi.notFound(
        'Estúdio sem animes cadastrados',
        'NO_ANIMES_FOR_ESTUDIO',
      );
    }

    return respostaLista(res, animes);
  },
);

export const criarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = estudioCriacaoDTO.parse(req.body);
    const novo = await estudiosServico.criar(dados);
    return respostaCriado(res, novo, 'Estúdio criado com sucesso');
  },
);

export const adicionarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = estudioCriacaoDTO.parse(req.body);
    try {
      const [novoEstudio] = await db
        .insert(estudios)
        .values({
          nome: dados.nome,
        })
        .returning();
      return respostaCriado(res, novoEstudio, 'Estúdio adicionado com sucesso');
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === '23505') {
        throw ErroApi.conflict('Estúdio já existe', 'ESTUDIO_DUPLICADO');
      }
      throw err;
    }
  },
);

export const atualizarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTUDIO_ID');
    }

    const dados = estudioAtualizacaoDTO.parse(req.body);
    const atualizado = await estudiosServico.atualizar(id, dados);

    if (!atualizado) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaAtualizado(
      res,
      atualizado,
      'Estúdio atualizado com sucesso',
    );
  },
);

export const deletarEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTUDIO_ID');
    }

    const deletado = await estudiosServico.deletar(id);
    if (!deletado) {
      throw ErroApi.notFound('Estúdio', 'ESTUDIO_NOT_FOUND');
    }

    return respostaSucesso(res, null, {
      mensagem: 'Estúdio removido com sucesso',
    });
  },
);
