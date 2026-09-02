import { z } from 'zod';

const animeSchema = z.object({
    id: z.union([z.number(), z.string()]).optional(),
    titulo: z.string().trim().min(1, 'Título é obrigatório'),
    sinopse: z.string().optional(),
    tipo: z.string().optional(),
    temporada: z.number().optional(),
    ano: z.number().optional(),
    anoLancamento: z.number().optional(),
    quantidadeEpisodios: z.union([z.number(), z.string()]).optional(),
    capaUrl: z.string().url().optional(),
    franquiaId: z.union([z.number(), z.string()]).optional(),
    estudioId: z.union([z.number(), z.string()]).optional(),
    statusId: z.union([z.number(), z.string()]).optional(),
    status: z.union([z.string(), z.number()]).optional(),
    genero: z.union([z.string(), z.number()]).optional(),
    generos: z.array(z.union([z.string(), z.number()])).optional(),
});

export const idsSchema = z.object({
    ids: z.array(z.number().int().positive()).min(1, 'Informe pelo menos um ID'),
});

export const batchBodySchema = z.union([
    z.array(animeSchema).min(1, 'Informe pelo menos um anime'),
    animeSchema,
    idsSchema,
]);

export { animeSchema };
