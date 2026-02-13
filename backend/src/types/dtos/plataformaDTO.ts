import { z } from 'zod';

export const plataformaDTO = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  website: z.string().url().optional(),
  descricao: z.string().optional(),
  ativa: z.boolean().optional().default(true),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type PlataformaDTO = z.infer<typeof plataformaDTO>;

export const plataformaCriacaoDTO = plataformaDTO.pick({
  nome: true,
  website: true,
  descricao: true,
  ativa: true,
});

export type PlataformaCriacaoDTO = z.infer<typeof plataformaCriacaoDTO>;

export const plataformaAtualizacaoDTO = plataformaDTO.partial();

export type PlataformaAtualizacaoDTO = z.infer<typeof plataformaAtualizacaoDTO>;
