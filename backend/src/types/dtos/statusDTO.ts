import { z } from 'zod';

export const statusDTO = z.object({
  id: z.number().int().positive().optional(),
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type StatusDTO = z.infer<typeof statusDTO>;

export const statusCriacaoDTO = statusDTO.pick({
  nome: true,
});

export type StatusCriacaoDTO = z.infer<typeof statusCriacaoDTO>;

export const statusAtualizacaoDTO = statusDTO
  .pick({ nome: true })
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe ao menos um campo para atualização',
  );

export type StatusAtualizacaoDTO = z.infer<typeof statusAtualizacaoDTO>;
