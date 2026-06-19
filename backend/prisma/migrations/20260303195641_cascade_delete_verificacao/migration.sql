-- DropForeignKey
ALTER TABLE "Verificacao" DROP CONSTRAINT "Verificacao_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
