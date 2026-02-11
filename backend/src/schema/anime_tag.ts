import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { tags } from './tags';

export const anime_tag = pgTable('anime_tag', {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').references(() => animes.id),
    tag_id: integer('tag_id').references(() => tags.id)
});