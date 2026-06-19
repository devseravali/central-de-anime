-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "estacaoId" INTEGER;

-- CreateTable
CREATE TABLE "Estacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Estacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estacao_nome_key" ON "Estacao"("nome");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estacaoId_fkey" FOREIGN KEY ("estacaoId") REFERENCES "Estacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
