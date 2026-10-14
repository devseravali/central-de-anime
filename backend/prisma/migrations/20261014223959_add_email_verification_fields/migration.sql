-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "verificaEmailExpiraEm" TIMESTAMP(3),
ADD COLUMN     "verificaEmailTokenHash" TEXT;
