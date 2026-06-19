/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Genero` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Genero_nome_key" ON "Genero"("nome");
