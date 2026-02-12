import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { generosServico } from '../services/generosServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import {
  generoCriacaoDTO,
  generoAtualizacaoDTO,
} from '../types/dtos/generoDTO';

function validarIdParam(idParam: string | string[] | undefined): number {
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idString);
  if (!idString || Number.isNaN(id)) {
    throw ErroApi.badRequest('ID do gênero inválido', 'INVALID_GENERO_ID');
  }
  return id;
}

function validarNomeParam(nome: string | undefined): string {
  const value = nome?.trim();
  if (!value) {
    throw ErroApi.badRequest('Nome do gênero inválido', 'INVALID_GENERO_NAME');
  }
  return value;
}

export const buscarTodosGeneros = asyncHandler(
  async (req: Request, res: Response) => {
    const pagina = parseInt(String(req.query.pagina ?? 1), 10);
    const limite = parseInt(String(req.query.limite ?? 20), 10);
    const generos = await generosServico.listar({ pagina, limite });
    return respostaLista(res, generos);
  },
);

export const buscarGeneroPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = validarIdParam(req.params.id);

    const genero = await generosServico.buscarPorId(id);
    if (!genero) {
      throw ErroApi.notFound('Gênero', 'GENERO_NOT_FOUND');
    }

    return respostaSucesso(res, genero);
  },
);

export const buscarGeneroPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nomeParam = Array.isArray(req.params.nome)
      ? req.params.nome[0]
      : req.params.nome;
    const nome = validarNomeParam(nomeParam);

    const genero = await generosServico.buscarPorNome(nome);
    if (!genero) {
      throw ErroApi.notFound('Gênero', 'GENERO_NOT_FOUND');
    }

    return respostaSucesso(res, genero);
  },
);

export const listarAnimesPorGenero = asyncHandler(
  async (req: Request, res: Response) => {
    const nomeParam = Array.isArray(req.params.nome)
      ? req.params.nome[0]
      : req.params.nome;
    const nome = validarNomeParam(nomeParam);

    const animes = await generosServico.listarAnimesPorNomeGenero(nome);
    if (!animes || animes.length === 0) {
      throw ErroApi.notFound(
        'Gênero sem animes cadastrados',
        'NO_ANIMES_FOR_GENERO',
      );
    }

    return respostaLista(res, animes);
  },
);

export const adicionarGenero = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = generoCriacaoDTO.parse(req.body);

    const existente = await generosServico.buscarPorNome(dados.nome);
    if (existente) {
      throw ErroApi.conflict(
        'Gênero já existe no banco de dados',
        'GENERO_ALREADY_EXISTS',
      );
    }

    const novo = await generosServico.criar(dados);
    return respostaCriado(res, novo, 'Gênero criado com sucesso');
  },
);

export const atualizarGenero = asyncHandler(
  async (req: Request, res: Response) => {
    const id = validarIdParam(req.params.id);
    const dados = generoAtualizacaoDTO.parse(req.body);

    if (dados.nome) {
      const existente = await generosServico.buscarPorNome(dados.nome);
      if (existente && existente.id !== id) {
        throw ErroApi.conflict(
          'Nome de gênero já existe',
          'GENERO_ALREADY_EXISTS',
        );
      }
    }

    const atualizado = await generosServico.atualizar(id, dados);
    if (!atualizado) {
      throw ErroApi.notFound('Gênero', 'GENERO_NOT_FOUND');
    }

    return respostaAtualizado(res, atualizado, 'Gênero atualizado com sucesso');
  },
);

export const deletarGenero = asyncHandler(
  async (req: Request, res: Response) => {
    const id = validarIdParam(req.params.id);

    const deletado = await generosServico.deletar(id);
    if (!deletado) {
      throw ErroApi.notFound('Gênero', 'GENERO_NOT_FOUND');
    }

    return respostaSucesso(res, null, {
      mensagem: 'Gênero removido com sucesso',
    });
  },
);
