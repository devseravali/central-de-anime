-- Migration para remover o campo url da tabela plataformas, caso exista
ALTER TABLE plataformas DROP COLUMN IF EXISTS url;