-- CreateTable
CREATE TABLE "AnimeGenero" (
    "animeId" INTEGER NOT NULL,
    "generoId" INTEGER NOT NULL,

    CONSTRAINT "AnimeGenero_pkey" PRIMARY KEY ("animeId","generoId")
);

-- CreateTable
CREATE TABLE "AnimePlataforma" (
    "animeId" INTEGER NOT NULL,
    "plataformaId" INTEGER NOT NULL,

    CONSTRAINT "AnimePlataforma_pkey" PRIMARY KEY ("animeId","plataformaId")
);

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
