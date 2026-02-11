DO $$
BEGIN
  DROP TYPE IF EXISTS "moderacao_status";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "animes" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "personagens" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "generos" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "estudios" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "plataformas" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "status" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "temporadas" DROP COLUMN IF EXISTS "moderacao_status";
--> statement-breakpoint
ALTER TABLE "estacoes" DROP COLUMN IF EXISTS "moderacao_status";
