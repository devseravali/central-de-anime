-- CreateTable
CREATE TABLE "NotaAnimeUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaAnimeUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotaAnimeUsuario_usuarioId_animeId_key" ON "NotaAnimeUsuario"("usuarioId", "animeId");

-- AddForeignKey
ALTER TABLE "NotaAnimeUsuario" ADD CONSTRAINT "NotaAnimeUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaAnimeUsuario" ADD CONSTRAINT "NotaAnimeUsuario_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
