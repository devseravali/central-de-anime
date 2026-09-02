import { z } from 'zod';

export const updateProfileSchema = z
	.object({
		nome: z.string().trim().min(1).optional(),
		email: z.string().trim().email().optional(),
		senha: z.string().min(1).optional(),
		avatar: z.string().trim().url().nullable().optional(),
	})
	.strict();