-- DropForeignKey
ALTER TABLE "Sessao" DROP CONSTRAINT "Sessao_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
