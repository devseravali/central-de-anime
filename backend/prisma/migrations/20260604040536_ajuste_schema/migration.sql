/*
  Warnings:

  - You are about to drop the column `estacao_id` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `temporada` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `animeId` on the `Episodio` table. All the data in the column will be lost.
  - You are about to drop the `AnimeEstacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimeEstudio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimeGenero` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimePersonagem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimePlataforma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimeStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimeTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estacao` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `franquiaId` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_estacao_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeEstacao" DROP CONSTRAINT "AnimeEstacao_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeEstacao" DROP CONSTRAINT "AnimeEstacao_estacao_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeEstudio" DROP CONSTRAINT "AnimeEstudio_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeEstudio" DROP CONSTRAINT "AnimeEstudio_estudio_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenero" DROP CONSTRAINT "AnimeGenero_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenero" DROP CONSTRAINT "AnimeGenero_genero_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimePersonagem" DROP CONSTRAINT "AnimePersonagem_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimePersonagem" DROP CONSTRAINT "AnimePersonagem_personagem_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimePlataforma" DROP CONSTRAINT "AnimePlataforma_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimePlataforma" DROP CONSTRAINT "AnimePlataforma_plataforma_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeStatus" DROP CONSTRAINT "AnimeStatus_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeStatus" DROP CONSTRAINT "AnimeStatus_status_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeTag" DROP CONSTRAINT "AnimeTag_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "AnimeTag" DROP CONSTRAINT "AnimeTag_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "quantidadeEpisodios" DROP CONSTRAINT "Episodio_animeId_fkey";

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "estacao_id",
DROP COLUMN "temporada",
ADD COLUMN     "franquiaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quantidadeEpisodios" DROP COLUMN "animeId";

-- DropTable
DROP TABLE "AnimeEstacao";

-- DropTable
DROP TABLE "AnimeEstudio";

-- DropTable
DROP TABLE "AnimeGenero";

-- DropTable
DROP TABLE "AnimePersonagem";

-- DropTable
DROP TABLE "AnimePlataforma";

-- DropTable
DROP TABLE "AnimeStatus";

-- DropTable
DROP TABLE "AnimeTag";

-- DropTable
DROP TABLE "Estacao";

-- CreateTable
CREATE TABLE "Franquia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "anoInicio" INTEGER,

    CONSTRAINT "Franquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnimeToPersonagem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnimeToPersonagem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AnimeToPersonagem_B_index" ON "_AnimeToPersonagem"("B");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_franquiaId_fkey" FOREIGN KEY ("franquiaId") REFERENCES "Franquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToPersonagem" ADD CONSTRAINT "_AnimeToPersonagem_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToPersonagem" ADD CONSTRAINT "_AnimeToPersonagem_B_fkey" FOREIGN KEY ("B") REFERENCES "Personagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
