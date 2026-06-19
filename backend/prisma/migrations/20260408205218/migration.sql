-- CreateTable
CREATE TABLE "PersonagemFavorito" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "personagem_id" INTEGER NOT NULL,

    CONSTRAINT "PersonagemFavorito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonagemFavorito_usuario_id_personagem_id_key" ON "PersonagemFavorito"("usuario_id", "personagem_id");

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_personagem_id_fkey" FOREIGN KEY ("personagem_id") REFERENCES "Personagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
