import { z } from 'zod';

export const usuarioDTO = z.object({
  id: z.number().int().positive(),

  nome: z.string().min(1).max(255),

  email: z.string().email(),

  status: z.enum(['ativo', 'pendente', 'suspenso', 'banido']),

  emailVerificado: z.boolean(),

  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional()
    .nullable(),

  avatarUrl: z.string().url().optional().nullable(),

  bio: z.string().max(160).optional().nullable(),

  criadoEm: z.string().datetime(),

  atualizadoEm: z.string().datetime(),
});

export type UsuarioDTO = z.infer<typeof usuarioDTO>;

export const usuarioCriacaoDTO = z.object({
  nome: z.string().min(1).max(255),

  email: z.string().email(),

  senha: z.string().min(6).max(100),

  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),

  avatarUrl: z.string().url().optional(),

  bio: z.string().max(160).optional(),
});

export type UsuarioCriacaoDTO = z.infer<typeof usuarioCriacaoDTO>;

export const usuarioLoginDTO = z.object({
  email: z.string().email(),
  senha: z.string().min(6).max(100),
});

export type UsuarioLoginDTO = z.infer<typeof usuarioLoginDTO>;

export const usuarioAtualizacaoDTO = z
  .object({
    nome: z.string().min(1).max(255).optional(),

    email: z.string().email().optional(),

    username: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional()
      .nullable(),

    avatarUrl: z.string().url().optional().nullable(),

    bio: z.string().max(160).optional().nullable(),
  })
  .refine((d) => Object.keys(d).length > 0);

export type UsuarioAtualizacaoDTO = z.infer<typeof usuarioAtualizacaoDTO>;
