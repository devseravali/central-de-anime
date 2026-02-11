-- Adiciona a coluna status na tabela generos
ALTER TABLE "generos" ADD COLUMN "status" VARCHAR(255) NOT NULL DEFAULT 'pendente';
