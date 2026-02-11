ALTER TABLE "principais_obras" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "principais_obras" CASCADE;--> statement-breakpoint
ALTER TABLE "animes" ADD CONSTRAINT "animes_nome_unique" UNIQUE("nome");