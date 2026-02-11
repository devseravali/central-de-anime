DO $$
BEGIN
  CREATE TYPE "moderacao_status" AS ENUM (
    'pendente',
    'aprovado',
    'rejeitado',
    'removido'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "generos" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "estudios" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "plataformas" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "status" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "temporadas" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
--> statement-breakpoint
ALTER TABLE "estacoes" ADD COLUMN IF NOT EXISTS "moderacao_status" moderacao_status NOT NULL DEFAULT 'pendente';
