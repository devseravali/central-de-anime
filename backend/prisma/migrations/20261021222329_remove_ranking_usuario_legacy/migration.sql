/*
  Warnings:

  - You are about to drop the `RankingUsuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RankingUsuario" DROP CONSTRAINT "RankingUsuario_usuarioId_fkey";

-- DropTable
DROP TABLE "RankingUsuario";
