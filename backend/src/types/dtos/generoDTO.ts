import { z } from 'zod';

export const generoDTO = z.object({
  id: z.number().int().positive().optional(),

  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),

  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type GeneroDTO = z.infer<typeof generoDTO>;

export const generoCriacaoDTO = generoDTO.pick({
  nome: true,
  descricao: true,
});

export type GeneroCriacaoDTO = z.infer<typeof generoCriacaoDTO>;

export const generoAtualizacaoDTO = generoDTO
  .pick({
    nome: true,
    descricao: true,
  })
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe ao menos um campo para atualização',
  );

export type GeneroAtualizacaoDTO = z.infer<typeof generoAtualizacaoDTO>;