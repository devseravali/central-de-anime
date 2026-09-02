import { z } from 'zod';

export const promoteSchema = z
	.object({
		usuarioId: z.coerce.number().int().positive(),
		nivel: z.string().trim().min(1),
	})
	.strict();