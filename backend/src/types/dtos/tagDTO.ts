import { z } from 'zod';

export const tagDTO = z.object({
  id: z.number().optional(),

  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  descricao: z.string().max(500).optional(),

  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido')
    .optional(),

  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type TagDTO = z.infer<typeof tagDTO>;

export const tagCriacaoDTO = tagDTO.pick({
  nome: true,
  descricao: true,
  cor: true,
});

export type TagCriacaoDTO = z.infer<typeof tagCriacaoDTO>;

export const tagAtualizacaoDTO = tagDTO
  .pick({
    nome: true,
    descricao: true,
    cor: true,
  })
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe ao menos um campo para atualização',
  );

export type TagAtualizacaoDTO = z.infer<typeof tagAtualizacaoDTO>;