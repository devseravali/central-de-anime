import { z } from 'zod';

export const plataformaDTO = z.object({
  id: z.number().optional(),
  nome: z.string(),
});

export type PlataformaDTO = z.infer<typeof plataformaDTO>;

export const plataformaCriacaoDTO = plataformaDTO.pick({
  nome: true,
});

export type AtualizarPlataformaDTO = {
  nome?: string;
};

export type PlataformaCriacaoDTO = z.infer<typeof plataformaCriacaoDTO>;

export const plataformaAtualizacaoDTO = plataformaDTO.partial();

export type PlataformaAtualizacaoDTO = z.infer<typeof plataformaAtualizacaoDTO>;
