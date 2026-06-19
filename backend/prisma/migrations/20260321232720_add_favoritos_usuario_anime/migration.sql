-- CreateTable
CREATE TABLE "UsuarioFavoritoAnime" (
    "usuarioId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioFavoritoAnime_pkey" PRIMARY KEY ("usuarioId","animeId")
);

-- AddForeignKey
ALTER TABLE "UsuarioFavoritoAnime" ADD CONSTRAINT "UsuarioFavoritoAnime_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioFavoritoAnime" ADD CONSTRAINT "UsuarioFavoritoAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
