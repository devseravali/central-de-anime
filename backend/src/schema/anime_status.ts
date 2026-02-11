import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import {  status } from './status';

export const anime_status = pgTable('anime_status', {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').references(() => animes.id),
    status_id: integer('status_id').references(() => status.id)
});