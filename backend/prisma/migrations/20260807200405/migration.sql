-- CreateTable
CREATE TABLE "Anime" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "temporada" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "sinopse" VARCHAR(5000) NOT NULL,
    "capaUrl" TEXT,
    "quantidadeEpisodios" INTEGER NOT NULL DEFAULT 0,
    "franquiaId" INTEGER,
    "estudioId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "estacaoId" INTEGER,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Estacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Franquia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "anoInicio" INTEGER,

    CONSTRAINT "Franquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "principaisObras" VARCHAR(5000) NOT NULL,

    CONSTRAINT "Estudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temporada" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "ano" INTEGER,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "Temporada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episodio" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" VARCHAR(2000) NOT NULL,
    "imagemUrl" TEXT,
    "dataExibicao" TIMESTAMP(3),
    "temporadaId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "Episodio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "avatar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchProgress" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "episodioId" INTEGER NOT NULL,
    "assistido" BOOLEAN NOT NULL DEFAULT false,
    "segundosAssistidos" INTEGER NOT NULL DEFAULT 0,
    "porcentagem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "totalEpisodiosAssistidos" INTEGER NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheAnime" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "rankingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CacheAnime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeTag" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeTagAnime" (
    "animeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "AnimeTagAnime_pkey" PRIMARY KEY ("animeId","tagId")
);

-- CreateTable
CREATE TABLE "UsuarioFavoritoAnime" (
    "usuarioId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioFavoritoAnime_pkey" PRIMARY KEY ("usuarioId","animeId")
);

-- CreateTable
CREATE TABLE "NotaAnimeUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NotaAnimeUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personagem" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,
    "sobre" VARCHAR(5000) NOT NULL,

    CONSTRAINT "Personagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimePersonagem" (
    "animeId" INTEGER NOT NULL,
    "personagemId" INTEGER NOT NULL,

    CONSTRAINT "AnimePersonagem_pkey" PRIMARY KEY ("animeId","personagemId")
);

-- CreateTable
CREATE TABLE "PersonagemFavorito" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "personagemId" INTEGER NOT NULL,

    CONSTRAINT "PersonagemFavorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'moderador',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "dispositivo" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "revogadoEm" TIMESTAMP(3),

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capas" (
    "id" SERIAL NOT NULL,
    "nome_original" TEXT NOT NULL,
    "nome_salvo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,

    CONSTRAINT "Capas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genero" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Genero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filtro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Filtro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estacao_nome_key" ON "Estacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Franquia_nome_key" ON "Franquia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Estudio_nome_key" ON "Estudio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Status_nome_key" ON "Status"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Temporada_animeId_numero_key" ON "Temporada"("animeId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Episodio_temporadaId_numero_key" ON "Episodio"("temporadaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WatchProgress_usuarioId_episodioId_key" ON "WatchProgress"("usuarioId", "episodioId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingUsuario_usuarioId_key" ON "RankingUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "CacheAnime_animeId_key" ON "CacheAnime"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeTag_nome_key" ON "AnimeTag"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "NotaAnimeUsuario_usuarioId_animeId_key" ON "NotaAnimeUsuario"("usuarioId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonagemFavorito_usuarioId_personagemId_key" ON "PersonagemFavorito"("usuarioId", "personagemId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_usuarioId_key" ON "Admin"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Genero_nome_key" ON "Genero"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Plataforma_nome_key" ON "Plataforma"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Filtro_nome_key" ON "Filtro"("nome");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_franquiaId_fkey" FOREIGN KEY ("franquiaId") REFERENCES "Franquia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estacaoId_fkey" FOREIGN KEY ("estacaoId") REFERENCES "Estacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temporada" ADD CONSTRAINT "Temporada_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episodio" ADD CONSTRAINT "Episodio_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episodio" ADD CONSTRAINT "Episodio_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "Episodio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingUsuario" ADD CONSTRAINT "RankingUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CacheAnime" ADD CONSTRAINT "CacheAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTagAnime" ADD CONSTRAINT "AnimeTagAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTagAnime" ADD CONSTRAINT "AnimeTagAnime_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "AnimeTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioFavoritoAnime" ADD CONSTRAINT "UsuarioFavoritoAnime_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioFavoritoAnime" ADD CONSTRAINT "UsuarioFavoritoAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaAnimeUsuario" ADD CONSTRAINT "NotaAnimeUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaAnimeUsuario" ADD CONSTRAINT "NotaAnimeUsuario_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "Personagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonagemFavorito" ADD CONSTRAINT "PersonagemFavorito_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "Personagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
