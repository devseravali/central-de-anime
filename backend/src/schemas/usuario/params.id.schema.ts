import { z } from 'zod';

export const paramsIdSchema = z
	.object({
		id: z.coerce.number().int().positive(),
	})
	.strict();