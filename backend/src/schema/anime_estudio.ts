import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { estudios } from './estudios';

export const anime_estudio = pgTable('anime_estudio', {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').references(() => animes.id),
    estudio_id: integer('estudio_id').references(() => estudios.id)
});