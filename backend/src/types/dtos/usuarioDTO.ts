import { z } from 'zod';

export const usuarioDTO = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido'),

  status: z.enum(['ativo', 'pendente', 'suspenso', 'banido']).optional(),
  emailVerificado: z.boolean().optional(),

  username: z.string().max(40).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(160).optional(),

  criadoEm: z.date().optional(),
  atualizadoEm: z.date().optional(),
});

export type UsuarioDTO = z.infer<typeof usuarioDTO>;

export const usuarioCriacaoDTO = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type UsuarioCriacaoDTO = z.infer<typeof usuarioCriacaoDTO>;

export const usuarioLoginDTO = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type UsuarioLoginDTO = z.infer<typeof usuarioLoginDTO>;

export const usuarioAtualizacaoDTO = z
  .object({
    nome: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'Informe ao menos um campo');

export type UsuarioAtualizacaoDTO = z.infer<typeof usuarioAtualizacaoDTO>;
