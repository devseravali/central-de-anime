import type { Request, Response } from 'express';
import { relacoesServico } from '../services/relacoesServico';
import {
  relacoesTagSchema,
  relacoesStatusSchema,
  relacoesGeneroSchema,
  relacoesEstacaoSchema,
  relacoesPlataformaSchema,
  relacoesEstudioSchema,
  relacoesPersonagemSchema,
  relacoesAnimeSchema,
  relacoesTituloSchema,
  relacoesAnoSchema,
} from '../schemas/relacoesSchema';

export const relacoesControlador = {
  listarAnimesPorAno: async (req: Request, res: Response) => {
    try {
      const { ano } = relacoesAnoSchema.parse({ ano: req.params.ano });
      const animes = await relacoesServico.listarAnimesPorAno(ano);
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  buscarTodasTags: async (_req: Request, res: Response) => {
    try {
      const tags = await relacoesServico.buscarTodasTags();
      return res.status(200).json({ dados: tags });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  },

  buscarAnimesPorTitulo: async (req: Request, res: Response) => {
    try {
      const { titulo } = relacoesTituloSchema.parse({
        titulo: req.query.titulo ?? '',
      });
      const animes = await relacoesServico.buscarAnimesPorTitulo(titulo);
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarPersonagensdeUmAnime: async (req: Request, res: Response) => {
    try {
      const { animeId } = relacoesAnimeSchema.parse({
        animeId: req.params.animeId,
      });
      const personagens = await relacoesServico.listarPersonagensdeUmAnime(
        Number(animeId),
      );
      return res.status(200).json(personagens);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  overviewRelacoes: async (_req: Request, res: Response) => {
    try {
      const [animes, personagens, estudios, tags] = await Promise.all([
        relacoesServico.listarAnimesPorAno(0).then((a) => a.length),
        relacoesServico.listarPersonagensdeUmAnime(0).then((p) => p.length),
        relacoesServico.buscarEstudiosPorNome('').then((e) => e.length),
        relacoesServico.buscarTagsPorNome('').then((t) => t.length),
      ]);
      return res.status(200).json({ animes, personagens, estudios, tags });
    } catch {
      return res.status(500).json({ error: 'Erro ao gerar overview' });
    }
  },

  buscarEstacoesPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const estacoes = await relacoesServico.buscarEstacoesPorNome(nome);
    return res.status(200).json(estacoes);
  },

  buscarStatusPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const status = await relacoesServico.buscarStatusPorNome(nome);
    return res.status(200).json(status);
  },

  buscarEstudiosPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const estudios = await relacoesServico.buscarEstudiosPorNome(nome);
    return res.status(200).json(estudios);
  },

  buscarPlataformasPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const plataformas = await relacoesServico.buscarPlataformasPorNome(nome);
    return res.status(200).json(plataformas);
  },

  buscarTagsPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const tags = await relacoesServico.buscarTagsPorNome(nome);
    return res.status(200).json({ dados: tags });
  },

  buscarPersonagensPorNome: async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '');
    const personagens = await relacoesServico.buscarPersonagensPorNome(nome);
    return res.status(200).json({ dados: personagens });
  },
  listarAnimesdeUmaTag: async (req: Request, res: Response) => {
    try {
      const { tagId } = relacoesTagSchema.parse({ tagId: req.params.tagId });
      const animes = await relacoesServico.listarAnimesdeUmaTag(Number(tagId));
      return res.status(200).json({ dados: animes });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmStatus: async (req: Request, res: Response) => {
    try {
      const { statusId } = relacoesStatusSchema.parse({
        statusId: req.params.statusId,
      });
      const animes = await relacoesServico.listarAnimesdeUmStatus(
        Number(statusId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmGenero: async (req: Request, res: Response) => {
    try {
      const { generoId } = relacoesGeneroSchema.parse({
        generoId: req.params.generoId,
      });
      const animes = await relacoesServico.listarAnimesdeUmGenero(
        Number(generoId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmaEstacao: async (req: Request, res: Response) => {
    try {
      const { estacaoId } = relacoesEstacaoSchema.parse({
        estacaoId: req.params.estacaoId,
      });
      const animes = await relacoesServico.listarAnimesdeUmaEstacao(
        Number(estacaoId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmaPlataforma: async (req: Request, res: Response) => {
    try {
      const { plataformaId } = relacoesPlataformaSchema.parse({
        plataformaId: req.params.plataformaId,
      });
      const animes = await relacoesServico.listarAnimesdeUmaPlataforma(
        Number(plataformaId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmEstudio: async (req: Request, res: Response) => {
    try {
      const { estudioId } = relacoesEstudioSchema.parse({
        estudioId: req.params.estudioId,
      });
      const animes = await relacoesServico.listarAnimesdeUmEstudio(
        Number(estudioId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  listarAnimesdeUmPersonagem: async (req: Request, res: Response) => {
    try {
      const { personagemId } = relacoesPersonagemSchema.parse({
        personagemId: req.params.personagemId,
      });
      const animes = await relacoesServico.listarAnimesdeUmPersonagem(
        Number(personagemId),
      );
      return res.status(200).json(animes);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },
};
