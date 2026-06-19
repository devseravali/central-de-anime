/*
  Warnings:

  - You are about to drop the column `episodios` on the `Anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "quantidadeEpisodios",
ADD COLUMN     "quantidadeEpisodios" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "temporada" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "Temporada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quantidadeEpisodios" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" VARCHAR(2000) NOT NULL,
    "dataExibicao" TIMESTAMP(3),
    "temporadaId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "Episodio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Temporada_animeId_numero_key" ON "temporada"("animeId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Episodio_temporadaId_numero_key" ON "quantidadeEpisodios"("temporadaId", "numero");

-- AddForeignKey
ALTER TABLE "temporada" ADD CONSTRAINT "Temporada_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantidadeEpisodios" ADD CONSTRAINT "Episodio_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "temporada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantidadeEpisodios" ADD CONSTRAINT "Episodio_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
