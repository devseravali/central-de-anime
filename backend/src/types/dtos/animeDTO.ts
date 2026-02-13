import { z } from 'zod';

const isoDateString = z
  .string()
  .datetime({ message: 'Data inválida (esperado ISO 8601)' });

export const animeDTO = z.object({
  id: z.number().int().positive().optional(),

  titulo: z.string().min(1, 'Título é obrigatório').max(255),
  descricao: z.string().max(5000).optional(),

  capaUrl: z.string().url('capaUrl deve ser uma URL válida').optional(),

  episodios: z.number().int().min(0).optional(),
  ano: z.number().int().min(1900).max(new Date().getFullYear()).optional(),

  criadoEm: isoDateString.optional(),
  atualizadoEm: isoDateString.optional(),
});

export type AnimeDTO = z.infer<typeof animeDTO>;

export const animeCriacaoDTO = animeDTO.pick({
  titulo: true,
  descricao: true,
  capaUrl: true,
  episodios: true,
  ano: true,
});

export type AnimeCriacaoDTO = z.infer<typeof animeCriacaoDTO>;

export const animeAtualizacaoDTO = animeCriacaoDTO.partial();

export type AnimeAtualizacaoDTO = z.infer<typeof animeAtualizacaoDTO>;