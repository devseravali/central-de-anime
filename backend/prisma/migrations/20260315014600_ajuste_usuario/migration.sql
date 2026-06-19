/*
  Warnings:

  - You are about to drop the column `googleId` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Usuario_googleId_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "googleId";
