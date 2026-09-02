import { z } from 'zod';

export const registerSchema = z.object({
    nome: z.string().trim().min(1),
    email: z.string().trim().email(),
    senha: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.string().trim().email(),
    senha: z.string().min(1),
});

export const refreshSchema = z.object({
    token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    senha: z.string().min(6),
});

export const logoutSchema = z.object({
    refreshToken: z.string().optional(),
});
