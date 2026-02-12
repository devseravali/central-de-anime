import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { personagemServico } from '../services/personagensServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import {
  personagemCriacaoDTO,
  personagemAtualizacaoDTO,
} from '../types/dtos/personagemDTO';

function exigirId(req: Request): number {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw ErroApi.badRequest(
      'ID do personagem inválido',
      'INVALID_PERSONAGEM_ID',
    );
  }
  return id;
}

function exigirNome(req: Request): string {
  const nome =
    typeof req.params.nome === 'string' ? req.params.nome.trim() : undefined;
  if (!nome) {
    throw ErroApi.badRequest(
      'Nome do personagem inválido',
      'INVALID_PERSONAGEM_NAME',
    );
  }
  return nome;
}

export const obterPersonagens = asyncHandler(
  async (_req: Request, res: Response) => {
    const personagens = await personagemServico.buscarTodosPersonagens();

    if (!personagens || personagens.length === 0) {
      throw ErroApi.notFound('Personagens', 'PERSONAGENS_NOT_FOUND');
    }

    return respostaLista(res, personagens);
  },
);

export const obterPersonagemPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const personagem = await personagemServico.buscarPersonagemPorId(id);
    if (!personagem) {
      throw ErroApi.notFound('Personagem', 'PERSONAGEM_NOT_FOUND');
    }

    return respostaSucesso(res, personagem);
  },
);

export const obterPersonagemPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = exigirNome(req);

    const personagem = await personagemServico.buscarPersonagemPorNome(nome);
    if (!personagem) {
      throw ErroApi.notFound('Personagem', 'PERSONAGEM_NOT_FOUND');
    }

    return respostaSucesso(res, personagem);
  },
);

export const obterAnimesPorPersonagem = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const animes = await personagemServico.listarAnimesPorPersonagemId(id);
    return respostaLista(res, animes);
  },
);

export const criarPersonagem = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = personagemCriacaoDTO.parse(req.body);

    if (!dados.nome) {
      throw ErroApi.badRequest(
        'Nome do personagem é obrigatório',
        'INVALID_PERSONAGEM_NAME',
      );
    }

    const criado = await personagemServico.adicionarPersonagem(dados as any);
    return respostaCriado(res, criado, 'Personagem criado com sucesso');
  },
);

export const atualizarPersonagem = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);
    const dados = personagemAtualizacaoDTO.parse(req.body);

    const atualizado = await personagemServico.atualizarPersonagem(
      id,
      dados as Partial<typeof dados>,
    );
    if (!atualizado) {
      throw ErroApi.notFound('Personagem', 'PERSONAGEM_NOT_FOUND');
    }

    return respostaAtualizado(
      res,
      atualizado,
      'Personagem atualizado com sucesso',
    );
  },
);

export const deletarPersonagem = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const deletado = await personagemServico.deletarPersonagem(id);
    if (!deletado) {
      throw ErroApi.notFound('Personagem', 'PERSONAGEM_NOT_FOUND');
    }

    return respostaSucesso(res, null, {
      mensagem: 'Personagem removido com sucesso',
    });
  },
);
