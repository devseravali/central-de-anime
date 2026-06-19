/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Tags` will be added. If there are existing duplicate values, this will fail.
  - Made the column `senha` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "senha" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tags_nome_key" ON "Tags"("nome");
