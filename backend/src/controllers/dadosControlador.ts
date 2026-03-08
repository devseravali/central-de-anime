import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { respostaLista, respostaSucesso } from '../helpers/responseHelpers';
import { z } from 'zod';
import { dadosSchema } from '../schemas/dadosSchema';
import { prisma } from '../lib/prisma';

export const buscarDados = asyncHandler(
  async (_req: Request, res: Response) => {
    const [generos, plataformas, tags, animes, estacoes] = await Promise.all([
      prisma.genero.findMany(),
      prisma.plataforma.findMany(),
      prisma.tags.findMany(),
      prisma.anime.findMany(),
      prisma.estacao.findMany(),
    ]);

    return respostaSucesso(res, {
      generos,
      plataformas,
      tags,
      animes,
      estacoes,
    });
  },
);

export const buscarPlataformas = asyncHandler(
  async (_req: Request, res: Response) => {
    const plataformas = await prisma.plataforma.findMany();
    return respostaLista(res, plataformas);
  },
);

export const buscarTags = asyncHandler(async (_req: Request, res: Response) => {
  const tags = await prisma.tags.findMany();
  return respostaLista(res, tags);
});

export const buscarStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const status = await prisma.status.findMany();
    return respostaLista(res, status);
  },
);

export const buscarTemporadas = asyncHandler(
  async (_req: Request, res: Response) => {
    const temporadas = await prisma.anime.findMany({
      distinct: ['temporada'],
      select: { temporada: true },
      where: { temporada: { not: undefined } },
    });
    const temporadasFormatadas = temporadas.map((t) => ({
      id: t.temporada,
      nome: String(t.temporada),
    }));
    return respostaLista(res, temporadasFormatadas);
  },
);

export const buscarEstudios = asyncHandler(
  async (_req: Request, res: Response) => {
    const estudios = await prisma.estudio.findMany();
    return respostaLista(res, estudios);
  },
);

export const buscarEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const estacoes = await prisma.estacao.findMany();
    return respostaLista(res, estacoes);
  },
);

export const buscarAnimes = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await prisma.anime.findMany();
    return respostaLista(res, animes);
  },
);

export const buscarPersonagens = asyncHandler(
  async (_req: Request, res: Response) => {
    const personagens = await prisma.personagem.findMany();
    return respostaLista(res, personagens);
  },
);

export const buscarGeneros = asyncHandler(
  async (_req: Request, res: Response) => {
    const generos = await prisma.genero.findMany();
    return respostaLista(res, generos);
  },
);

export const buscarPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const { entidade, nome } = req.params;
    const nomeBusca = Array.isArray(nome) ? nome[0] : nome;

    // Validação com Zod
    const nomeSchema = z.string().min(1, 'Nome para busca é obrigatório');
    const parseResult = nomeSchema.safeParse(nomeBusca);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ erro: 'Nome inválido', detalhes: parseResult.error.format() });
    }

    let resultado;
    switch (entidade) {
      case 'generos':
        resultado = await prisma.genero.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'plataformas':
        resultado = await prisma.plataforma.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'tags':
        resultado = await prisma.tags.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'animes':
        resultado = await prisma.anime.findMany({
          where: { titulo: { contains: nomeBusca, mode: 'insensitive' } },
        });
        resultado = resultado.map((a) => ({
          id: a.id,
          nome: a.titulo,
        }));
        break;
      case 'estacoes':
        resultado = await prisma.estacao.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'personagens':
        resultado = await prisma.personagem.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'estudios':
        resultado = await prisma.estudio.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      case 'temporadas':
        resultado = await prisma.anime.findMany({
          distinct: ['temporada'],
          select: { temporada: true },
          where: { temporada: { not: undefined } },
        });
        resultado = resultado.map((t) => ({
          id: t.temporada,
          nome: String(t.temporada),
        }));
        break;
      case 'status':
        resultado = await prisma.status.findMany({
          where: { nome: { contains: nomeBusca, mode: 'insensitive' } },
        });
        break;
      default:
        return res.status(400).json({ erro: 'Entidade inválida' });
    }
    return respostaLista(res, resultado);
  },
);
