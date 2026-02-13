import { z } from 'zod';

export const temporadaDTO = z.object({
  id: z.number().optional(),
  anime_id: z.number().int().positive(),
  slug: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.string().min(1),
  temporada: z.number().int().positive(),
  status_id: z.number().int().positive(),
  ano: z.number().int().min(1900),
  estacao_id: z.number().int().positive(),
  episodios: z.number().int().nonnegative(),
  sinopse: z.string().optional(),
});

export type TemporadaDTO = z.infer<typeof temporadaDTO>;

export const temporadaCriacaoDTO = temporadaDTO.omit({ id: true });
export type TemporadaCriacaoDTO = z.infer<typeof temporadaCriacaoDTO>;

export const temporadaAtualizacaoDTO = temporadaDTO
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Informe ao menos um campo para atualização',
  );

export type TemporadaAtualizacaoDTO = z.infer<typeof temporadaAtualizacaoDTO>;
