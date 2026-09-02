import { z } from 'zod';

export const episodioIdParamSchema = z.object({
    episodioId: z.coerce.number().int().positive(),
});

export const usuarioEpisodioParamsSchema = z.object({
    usuarioId: z.coerce.number().int().positive(),
    episodioId: z.coerce.number().int().positive(),
});

export const updateProgressBodySchema = z.object({
    segundosAssistidos: z.number().int().min(0).optional(),
    porcentagem: z.number().min(0).max(100).optional(),
    assistido: z.boolean().optional(),
}).strict();
