import { z } from 'zod';

export const paginationSchema = z
	.object({
		page: z.coerce.number().int().min(1),
		limit: z.coerce.number().int().min(1),
	})
	.strict();