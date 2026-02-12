import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { relacoesServico } from '../services/relacoesServico';
import { animesServico } from '../services/animesServico';
import { parseIdParam } from '../utils/parsers';
import { respostaLista, respostaSucesso } from '../helpers/responseHelpers';

function queryString(
  req: Request,
  key: string,
  code = 'INVALID_QUERY_PARAM',
): string {
  const value = req.query[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw ErroApi.badRequest(`Parâmetro ${key} inválido`, code);
  }
  return value.trim();
}

export const buscarAnimesDeUmaEntidade = asyncHandler(
  async (req: Request, res: Response) => {
    const { entidadeType, entidadeId } = req.params;
    const entidadeTypeStr = Array.isArray(entidadeType)
      ? entidadeType[0]
      : entidadeType;
    const id = Number(entidadeId);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest(
        'Parâmetro entidadeId inválido',
        'INVALID_ENTIDADE_ID',
      );
    }
    const animes = await relacoesServico.buscarAnimesDeUmaEntidade(
      entidadeTypeStr,
      id,
    );

    if (animes === null) {
      throw ErroApi.badRequest(
        'Entidade não suportada',
        'INVALID_ENTIDADE_TYPE',
      );
    }

    return respostaSucesso(res, animes);
  },
);

export const buscarAnimesRelacionadosComUmaEntidade = asyncHandler(
  async (req: Request, res: Response) => {
    const { entidadeType, entidadeId } = req.params;
    const entidadeTypeStr = Array.isArray(entidadeType)
      ? entidadeType[0]
      : entidadeType;
    const id = Number(entidadeId);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest(
        'Parâmetro entidadeId inválido',
        'INVALID_ENTIDADE_ID',
      );
    }

    const animes = await relacoesServico.buscarAnimesRelacionadosComUmaEntidade(
      entidadeTypeStr,
      id,
    );
    if (animes === null) {
      throw ErroApi.badRequest(
        'Entidade não suportada',
        'INVALID_ENTIDADE_TYPE',
      );
    }

    return respostaSucesso(res, animes);
  },
);

export const buscaEntidadesRelacionadasComAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null) {
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    }

    const entidades =
      await relacoesServico.buscaEntidadesRelacionadasComAnime(animeId);
    return respostaSucesso(res, entidades);
  },
);

// ---- buscas query
export const buscarTagsPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome');
    const dados = await relacoesServico.buscarTagsPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarPlataformasPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome');
    const dados = await relacoesServico.buscarPlataformasPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarEstacoesPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome');
    const dados = await relacoesServico.buscarEstacoesPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarStatusPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome', 'INVALID_NOME_PARAM');
    const dados = await relacoesServico.buscarStatusPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarEstudiosPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome');
    const dados = await relacoesServico.buscarEstudiosPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarTemporadasPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome', 'INVALID_NOME_PARAM');
    const dados = await relacoesServico.buscarTemporadasPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarPersonagensPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = queryString(req, 'nome');
    const dados = await relacoesServico.buscarPersonagensPorNome(nome);
    return respostaLista(res, dados);
  },
);

export const buscarAnimesPorTitulo = asyncHandler(
  async (req: Request, res: Response) => {
    const titulo = queryString(req, 'titulo', 'INVALID_TITULO_PARAM');
    const dados = await relacoesServico.buscarAnimesPorTitulo(titulo);
    return respostaLista(res, dados);
  },
);

export const buscarAnimePorId = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null) {
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    }

    const anime = await animesServico.buscarPorId(String(animeId));
    if (!anime) {
      throw ErroApi.notFound('Anime', 'ANIME_NOT_FOUND');
    }

    return respostaSucesso(res, anime);
  },
);

// ---- rotas específicas mantidas
export const listarPersonagensdeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.listarPersonagensdeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmPersonagem = asyncHandler(
  async (req: Request, res: Response) => {
    const personagemId = parseIdParam(req);
    if (personagemId === null)
      throw ErroApi.badRequest(
        'Parâmetro personagemId inválido',
        'INVALID_PERSONAGEM_ID',
      );
    const dados =
      await relacoesServico.listarAnimesdeUmPersonagem(personagemId);
    return respostaLista(res, dados);
  },
);

export const listarGenerosdeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.listarGenerosdeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmGenero = asyncHandler(
  async (req: Request, res: Response) => {
    const generoId = parseIdParam(req);
    if (generoId === null)
      throw ErroApi.badRequest(
        'Parâmetro generoId inválido',
        'INVALID_GENERO_ID',
      );
    const dados = await relacoesServico.listarAnimesdeUmGenero(generoId);
    return respostaLista(res, dados);
  },
);

export const buscarEstudiodeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.buscarEstudiodeUmAnime(animeId);
    return respostaSucesso(res, dados);
  },
);

export const listarAnimesdeUmEstudio = asyncHandler(
  async (req: Request, res: Response) => {
    const estudioId = parseIdParam(req);
    if (estudioId === null)
      throw ErroApi.badRequest(
        'Parâmetro estudioId inválido',
        'INVALID_ESTUDIO_ID',
      );
    const dados = await relacoesServico.listarAnimesdeUmEstudio(estudioId);
    return respostaLista(res, dados);
  },
);

export const listarPlataformasdeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.listarPlataformasdeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmaPlataforma = asyncHandler(
  async (req: Request, res: Response) => {
    const plataformaId = parseIdParam(req);
    if (plataformaId === null)
      throw ErroApi.badRequest(
        'Parâmetro plataformaId inválido',
        'INVALID_PLATAFORMA_ID',
      );
    const dados =
      await relacoesServico.listarAnimesdeUmaPlataforma(plataformaId);
    return respostaLista(res, dados);
  },
);

export const buscarTemporadadeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.buscarTemporadadeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmaTemporada = asyncHandler(
  async (req: Request, res: Response) => {
    const temporadaId = parseIdParam(req);
    if (temporadaId === null)
      throw ErroApi.badRequest(
        'Parâmetro temporadaId inválido',
        'INVALID_TEMPORADA_ID',
      );
    const dados = await relacoesServico.listarAnimesdeUmaTemporada(temporadaId);
    return respostaLista(res, dados);
  },
);

export const buscarEstacaodeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.buscarEstacaodeUmAnime(animeId);
    return respostaSucesso(res, dados);
  },
);

export const listarAnimesdeUmaEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const estacaoId = parseIdParam(req);
    if (estacaoId === null)
      throw ErroApi.badRequest(
        'Parâmetro estacaoId inválido',
        'INVALID_ESTACAO_ID',
      );
    const dados = await relacoesServico.listarAnimesdeUmaEstacao(estacaoId);
    return respostaLista(res, dados);
  },
);

export const buscarStatusdeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.buscarStatusdeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const statusId = parseIdParam(req);
    if (statusId === null)
      throw ErroApi.badRequest(
        'Parâmetro statusId inválido',
        'INVALID_STATUS_ID',
      );
    const dados = await relacoesServico.listarAnimesdeUmStatus(statusId);
    return respostaLista(res, dados);
  },
);

export const listarTagsdeUmAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const animeId = parseIdParam(req);
    if (animeId === null)
      throw ErroApi.badRequest(
        'Parâmetro animeId inválido',
        'INVALID_ANIME_ID',
      );
    const dados = await relacoesServico.listarTagsdeUmAnime(animeId);
    return respostaLista(res, dados);
  },
);

export const listarAnimesdeUmaTag = asyncHandler(
  async (req: Request, res: Response) => {
    const tagId = parseIdParam(req);
    if (tagId === null)
      throw ErroApi.badRequest('Parâmetro tagId inválido', 'INVALID_TAG_ID');
    const dados = await relacoesServico.listarAnimesdeUmaTag(tagId);
    return respostaLista(res, dados);
  },
);
