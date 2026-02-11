ALTER TABLE "animes" ADD COLUMN "anime_id" integer;--> statement-breakpoint
ALTER TABLE "animes" ADD CONSTRAINT "animes_anime_id_unique" UNIQUE("anime_id");