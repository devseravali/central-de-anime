/*
  Warnings:

  - You are about to drop the column `estudio_id` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `personagem_id` on the `PersonagemFavorito` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `PersonagemFavorito` table. All the data in the column will be lost.
  - You are about to drop the `_AnimeToGenero` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnimeToPersonagem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnimeToPlataforma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnimeToTags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioId,personagemId]` on the table `PersonagemFavorito` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estudioId` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `animeId` to the `Episodio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personagemId` to the `PersonagemFavorito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PersonagemFavorito` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_estudio_id_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_status_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonagemFavorito" DROP CONSTRAINT "PersonagemFavorito_personagem_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonagemFavorito" DROP CONSTRAINT "PersonagemFavorito_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToGenero" DROP CONSTRAINT "_AnimeToGenero_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToGenero" DROP CONSTRAINT "_AnimeToGenero_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToPersonagem" DROP CONSTRAINT "_AnimeToPersonagem_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToPersonagem" DROP CONSTRAINT "_AnimeToPersonagem_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToPlataforma" DROP CONSTRAINT "_AnimeToPlataforma_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToPlataforma" DROP CONSTRAINT "_AnimeToPlataforma_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToTags" DROP CONSTRAINT "_AnimeToTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToTags" DROP CONSTRAINT "_AnimeToTags_B_fkey";

-- DropIndex
DROP INDEX "PersonagemFavorito_usuario_id_personagem_id_key";

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "estudio_id",
DROP COLUMN "status_id",
ADD COLUMN     "estudioId" INTEGER NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quantidadeEpisodios" ADD COLUMN     "animeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PersonagemFavorito" DROP COLUMN "personagem_id",
DROP COLUMN "usuario_id",
ADD COLUMN     "personagemId" INTEGER NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "temporada" ALTER COLUMN "ano" DROP NOT NULL;

-- DropTable
DROP TABLE "_AnimeToGenero";

-- DropTable
DROP TABLE "_AnimeToPersonagem";

-- DropTable
DROP TABLE "_AnimeToPlataforma";

-- DropTable
DROP TABLE "_AnimeToTags";

-- CreateTable
CREATE TABLE "AnimeGenero" (
    "animeId" INTEGER NOT NULL,
    "generoId" INTEGER NOT NULL,

    CONSTRAINT "AnimeGenero_pkey" PRIMARY KEY ("animeId","generoId")
);

-- CreateTable
CREATE TABLE "AnimePlataforma" (
    "animeId" INTEGER NOT NULL,
    "plataformaId" INTEGER NOT NULL,

    CONSTRAINT "AnimePlataforma_pkey" PRIMARY KEY ("animeId","plataformaId")
);

-- CreateTable
CREATE TABLE "AnimeTag" (
    "animeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("animeId","tagId")
);

-- CreateTable
CREATE TABLE "AnimePersonagem" (
    "animeId" INTEGER NOT NULL,
    "personagemId" INTEGER NOT NULL,

    CONSTRAINT "AnimePersonagem_pkey" PRIMARY KEY ("animeId","personagemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonagemFavorito_usuarioId_personagemId_key" ON "PersonagemFavorito"("usuarioId", "personagemId");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantidadeEpisodios" ADD CONSTRAINT "Episodio_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTag" ADD CONSTRAINT "AnimeTag_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTag" ADD CONSTRAINT "AnimeTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "Personagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "Personagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
