/*
  Warnings:

  - You are about to drop the column `estacaoId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `animeId` on the `Temporada` table. All the data in the column will be lost.
  - You are about to drop the column `ano` on the `Temporada` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `Temporada` table. All the data in the column will be lost.
  - You are about to drop the `Estacao` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nome]` on the table `Temporada` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome` to the `Temporada` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_estacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Temporada" DROP CONSTRAINT "Temporada_animeId_fkey";

-- DropIndex
DROP INDEX "Temporada_animeId_numero_key";

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "estacaoId";

-- AlterTable
ALTER TABLE "Temporada" DROP COLUMN "animeId",
DROP COLUMN "ano",
DROP COLUMN "numero",
ADD COLUMN     "nome" TEXT NOT NULL;

-- DropTable
DROP TABLE "Estacao";

-- CreateIndex
CREATE UNIQUE INDEX "Temporada_nome_key" ON "Temporada"("nome");
