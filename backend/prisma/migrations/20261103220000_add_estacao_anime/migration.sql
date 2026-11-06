CREATE TABLE "Estacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    CONSTRAINT "Estacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Estacao_nome_key" ON "Estacao"("nome");

ALTER TABLE "Anime" ADD COLUMN "estacaoId" INTEGER;

ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estacaoId_fkey"
    FOREIGN KEY ("estacaoId") REFERENCES "Estacao"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
