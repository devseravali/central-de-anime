import { z } from 'zod';

export const estudioDTO = z.object({
  id: z.number().int().positive().optional(),

  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  pais: z
    .string()
    .max(100, 'País deve ter no máximo 100 caracteres')
    .optional(),

  website: z.string().url('Website inválido').optional(),

  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type EstudioDTO = z.infer<typeof estudioDTO>;

export const estudioCriacaoDTO = estudioDTO.pick({
  nome: true,
});

export type EstudioCriacaoDTO = z.infer<typeof estudioCriacaoDTO>;

export const estudioAtualizacaoDTO = estudioDTO
  .pick({
    nome: true,
  })
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe ao menos um campo para atualização',
  );

export type EstudioAtualizacaoDTO = z.infer<typeof estudioAtualizacaoDTO>;