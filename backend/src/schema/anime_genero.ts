import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { generos } from './generos';

export const anime_genero = pgTable('anime_genero', {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').references(() => animes.id),
    genero_id: integer('genero_id').references(() => generos.id)
}); 