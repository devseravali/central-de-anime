import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { personagens } from './personagens';

export const anime_personagem = pgTable('anime_personagem', {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').references(() => animes.id),
    personagem_id: integer('personagem_id').references(() => personagens.id)
});
