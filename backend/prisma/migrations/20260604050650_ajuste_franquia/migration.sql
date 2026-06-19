/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Franquia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Franquia_nome_key" ON "Franquia"("nome");
