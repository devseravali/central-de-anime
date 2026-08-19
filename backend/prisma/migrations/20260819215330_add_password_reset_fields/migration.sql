-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "resetSenhaExpiraEm" TIMESTAMP(3),
ADD COLUMN     "resetSenhaTokenHash" TEXT;
