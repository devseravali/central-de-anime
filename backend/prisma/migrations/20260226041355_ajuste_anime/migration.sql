/*
  Warnings:

  - You are about to drop the column `estacaoId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `estudioId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `generoId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `plataformaId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `tagsId` on the `Anime` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_estacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_estudioId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_generoId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_plataformaId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_tagsId_fkey";

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "estacaoId",
DROP COLUMN "estudioId",
DROP COLUMN "generoId",
DROP COLUMN "plataformaId",
DROP COLUMN "statusId",
DROP COLUMN "tagsId",
ALTER COLUMN "titulo" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_AnimeToGenero" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnimeToGenero_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnimeToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnimeToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnimeToPlataforma" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnimeToPlataforma_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AnimeToGenero_B_index" ON "_AnimeToGenero"("B");

-- CreateIndex
CREATE INDEX "_AnimeToTags_B_index" ON "_AnimeToTags"("B");

-- CreateIndex
CREATE INDEX "_AnimeToPlataforma_B_index" ON "_AnimeToPlataforma"("B");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estudio_id_fkey" FOREIGN KEY ("estudio_id") REFERENCES "Estudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estacao_id_fkey" FOREIGN KEY ("estacao_id") REFERENCES "Estacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToGenero" ADD CONSTRAINT "_AnimeToGenero_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToGenero" ADD CONSTRAINT "_AnimeToGenero_B_fkey" FOREIGN KEY ("B") REFERENCES "Genero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToTags" ADD CONSTRAINT "_AnimeToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToTags" ADD CONSTRAINT "_AnimeToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToPlataforma" ADD CONSTRAINT "_AnimeToPlataforma_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToPlataforma" ADD CONSTRAINT "_AnimeToPlataforma_B_fkey" FOREIGN KEY ("B") REFERENCES "Plataforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
