import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { temporadaServico } from '../services/temporadasServico';
import { parseIdParam } from '../utils/parsers';
import {
  temporadaAtualizacaoDTO,
  temporadaCriacaoDTO,
} from '../types/dtos/temporadaDTO';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';

export const listarTemporadas = asyncHandler(
  async (req: Request, res: Response) => {
    const pagina = parseInt(String(req.query.pagina ?? 1), 10);
    const limite = parseInt(String(req.query.limite ?? 20), 10);
    const temporadas = await temporadaServico.listarTemporadas({
      pagina,
      limite,
    });
    return respostaLista(res, temporadas);
  },
);

export const listarTemporadasPorAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = Number(req.query.animeId);
    if (isNaN(animeId)) {
      throw ErroApi.badRequest('animeId inválido');
    }
    const temporadas = await temporadaServico.listarTemporadasPorAnime(animeId);
    return respostaLista(res, temporadas);
  },
);

export const buscarTemporadaPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req);
    if (id === null) {
      throw ErroApi.badRequest('ID inválido');
    }

    const temporada = await temporadaServico.buscarTemporadasPorId(id);
    if (!temporada) {
      throw ErroApi.notFound('Temporada');
    }

    return respostaSucesso(res, temporada);
  },
);

export const criarTemporada = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = temporadaCriacaoDTO.parse(req.body);
    const temporada = await temporadaServico.criarTemporada(dados);
    return respostaCriado(res, temporada, 'Temporada criada com sucesso');
  },
);

export const atualizarTemporada = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req);
    if (id === null) {
      throw ErroApi.badRequest('ID inválido');
    }

    const dados = temporadaAtualizacaoDTO.parse(req.body);
    const temporada = await temporadaServico.atualizarTemporada(id, dados);
    if (!temporada) {
      throw ErroApi.notFound('Temporada');
    }

    return respostaAtualizado(res, temporada);
  },
);

export const deletarTemporada = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req);
    if (id === null) {
      throw ErroApi.badRequest('ID inválido');
    }

    const deletado = await temporadaServico.deletarTemporada(id);
    if (!deletado) {
      throw ErroApi.notFound('Temporada');
    }

    return respostaSucesso(res, { mensagem: 'Temporada deletada com sucesso' });
  },
);
