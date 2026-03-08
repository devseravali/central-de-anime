import { personagensServico } from '../services/personagemServico';
import type { Request, Response } from 'express';
import { personagensSchema } from '../schemas/personagensSchema';
import type { Personagem } from '../types/personagem';

function parsePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export const personagensControlador = {
  obterPersonagens: async (req: Request, res: Response) => {
    const personagens = await personagensServico.listar();
    return res.status(200).json(personagens);
  },

  obterPersonagemPorId: async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const personagem = await personagensServico.buscarPorId(id);

    if (!personagem) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    return res.status(200).json(personagem);
  },

  obterPersonagemPorNome: async (req: Request, res: Response) => {
    const nomeParam = req.params.nome;
    const nome = Array.isArray(nomeParam) ? nomeParam[0] : nomeParam;

    if (!nome) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    const personagem = await personagensServico.buscarPorNome(nome);

    if (!personagem) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    return res.status(200).json(personagem);
  },

  obterAnimesPorPersonagem: async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const animes = await personagensServico.listarAnimesPorPersonagem(id);

    return res.status(200).json(animes);
  },

  criarPersonagem: async (req: Request, res: Response) => {
    const parseResult = personagensSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: parseResult.error.format(),
      });
    }

    const personagem = await personagensServico.criar(parseResult.data);

    return res.status(201).json(personagem);
  },

  atualizarPersonagem: async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const parseResult = personagensSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: parseResult.error.format(),
      });
    }

    const personagem = await personagensServico.atualizar(id, {
      ...parseResult.data,
    });

    if (!personagem) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    return res.status(200).json(personagem);
  },

  deletarPersonagem: async (req: Request, res: Response) => {
    const id = parsePositiveInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const personagem = await personagensServico.deletar(id);

    if (!personagem) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    return res.status(200).json({
      message: 'Personagem removido com sucesso',
    });
  },
};
