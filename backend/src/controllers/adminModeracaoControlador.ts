import type { Request, Response } from 'express';
import { ErroApi } from '../errors/ErroApi';
import { parseId } from '../utils/parse';
import { asyncHandler } from '../utils/asyncHandler';

type ConteudoBody = {
  tipo: string;
  id: number;
};

function parseConteudoBody(body: unknown): ConteudoBody {
  if (!body || typeof body !== 'object') {
    throw ErroApi.badRequest('Dados inválidos.');
  }

  const raw = body as Record<string, unknown>;
  const tipo = typeof raw.tipo === 'string' ? raw.tipo.trim() : '';
  const id = Number(raw.id);

  if (!tipo || !Number.isInteger(id) || id <= 0) {
    throw ErroApi.badRequest('Dados inválidos.');
  }

  return { tipo, id };
}

export const listarSancoes = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(200).json({ sucesso: true, dados: [] });
  },
);

export const listarSancoesUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    parseId(req.params.id, 'id');
    res.status(200).json({ sucesso: true, dados: [] });
  },
);

export const suspenderUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id, 'id');
    res
      .status(200)
      .json({ sucesso: true, mensagem: 'Usuário suspenso com sucesso.', dados: { id } });
  },
);

export const banirUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id, 'id');
    res
      .status(200)
      .json({ sucesso: true, mensagem: 'Usuário banido com sucesso.', dados: { id } });
  },
);

export const reativarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id, 'id');
    res
      .status(200)
      .json({ sucesso: true, mensagem: 'Usuário reativado com sucesso.', dados: { id } });
  },
);

export const aprovarConteudo = asyncHandler(
  async (req: Request, res: Response) => {
    const conteudo = parseConteudoBody(req.body);
    res.status(200).json({
      sucesso: true,
      mensagem: 'Conteúdo aprovado com sucesso.',
      dados: conteudo,
    });
  },
);

export const rejeitarConteudo = asyncHandler(
  async (req: Request, res: Response) => {
    const conteudo = parseConteudoBody(req.body);
    res.status(200).json({
      sucesso: true,
      mensagem: 'Conteúdo rejeitado com sucesso.',
      dados: conteudo,
    });
  },
);

export const removerConteudo = asyncHandler(
  async (req: Request, res: Response) => {
    const conteudo = parseConteudoBody(req.body);
    res.status(200).json({
      sucesso: true,
      mensagem: 'Conteúdo removido com sucesso.',
      dados: conteudo,
    });
  },
);
