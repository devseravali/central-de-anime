/*
  Warnings:

  - The primary key for the `AnimeTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `animeId` on the `AnimeTag` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `AnimeTag` table. All the data in the column will be lost.
  - You are about to drop the column `principaisObras` on the `Estudio` table. All the data in the column will be lost.
  - You are about to drop the column `criadoEm` on the `NotaAnimeUsuario` table. All the data in the column will be lost.
  - You are about to drop the column `afiliacao` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `altura_inicial` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `aniversario` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `idade_inicial` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `papel` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `Personagem` table. All the data in the column will be lost.
  - You are about to drop the column `deletadoEm` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificado` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `senhaHash` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `AnimeGenero` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnimePlataforma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genero` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plataforma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenRecuperacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verificacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `capas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nome]` on the table `AnimeTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome` to the `AnimeTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_franquiaId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenero" DROP CONSTRAINT "AnimeGenero_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenero" DROP CONSTRAINT "AnimeGenero_generoId_fkey";

-- DropForeignKey
ALTER TABLE "AnimePlataforma" DROP CONSTRAINT "AnimePlataforma_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimePlataforma" DROP CONSTRAINT "AnimePlataforma_plataformaId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeTag" DROP CONSTRAINT "AnimeTag_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeTag" DROP CONSTRAINT "AnimeTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TokenRecuperacao" DROP CONSTRAINT "TokenRecuperacao_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Verificacao" DROP CONSTRAINT "Verificacao_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nivel" TEXT NOT NULL DEFAULT 'moderador';

-- AlterTable
ALTER TABLE "Anime" ALTER COLUMN "franquiaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AnimeTag" DROP CONSTRAINT "AnimeTag_pkey",
DROP COLUMN "animeId",
DROP COLUMN "tagId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Estudio" DROP COLUMN "principaisObras";

-- AlterTable
ALTER TABLE "NotaAnimeUsuario" DROP COLUMN "criadoEm";

-- AlterTable
ALTER TABLE "Personagem" DROP COLUMN "afiliacao",
DROP COLUMN "altura_inicial",
DROP COLUMN "aniversario",
DROP COLUMN "idade_inicial",
DROP COLUMN "papel",
DROP COLUMN "sexo";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "deletadoEm",
DROP COLUMN "emailVerificado",
DROP COLUMN "senhaHash",
ALTER COLUMN "atualizadoEm" DROP DEFAULT;

-- DropTable
DROP TABLE "AnimeGenero";

-- DropTable
DROP TABLE "AnimePlataforma";

-- DropTable
DROP TABLE "Genero";

-- DropTable
DROP TABLE "Plataforma";

-- DropTable
DROP TABLE "Tags";

-- DropTable
DROP TABLE "TokenRecuperacao";

-- DropTable
DROP TABLE "Verificacao";

-- DropTable
DROP TABLE "capas";

-- CreateTable
CREATE TABLE "WatchProgress" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "episodioId" INTEGER NOT NULL,
    "assistido" BOOLEAN NOT NULL DEFAULT false,
    "segundosAssistidos" INTEGER NOT NULL DEFAULT 0,
    "porcentagem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "totalEpisodiosAssistidos" INTEGER NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheAnime" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "rankingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CacheAnime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeTagAnime" (
    "animeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "AnimeTagAnime_pkey" PRIMARY KEY ("animeId","tagId")
);

-- CreateTable
CREATE TABLE "Capas" (
    "id" SERIAL NOT NULL,
    "nome_original" TEXT NOT NULL,
    "nome_salvo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,

    CONSTRAINT "Capas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchProgress_usuarioId_episodioId_key" ON "WatchProgress"("usuarioId", "episodioId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingUsuario_usuarioId_key" ON "RankingUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "CacheAnime_animeId_key" ON "CacheAnime"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeTag_nome_key" ON "AnimeTag"("nome");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_franquiaId_fkey" FOREIGN KEY ("franquiaId") REFERENCES "Franquia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "quantidadeEpisodios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingUsuario" ADD CONSTRAINT "RankingUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CacheAnime" ADD CONSTRAINT "CacheAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTagAnime" ADD CONSTRAINT "AnimeTagAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTagAnime" ADD CONSTRAINT "AnimeTagAnime_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "AnimeTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
