/*
  Warnings:

  - A unique constraint covering the columns `[caminho]` on the table `Capas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Capas_caminho_key" ON "Capas"("caminho");
