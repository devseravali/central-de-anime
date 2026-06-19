-- CreateTable
CREATE TABLE "AnimeStatus" (
    "anime_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,

    CONSTRAINT "AnimeStatus_pkey" PRIMARY KEY ("anime_id","status_id")
);

-- CreateTable
CREATE TABLE "Anime" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(300) NOT NULL,
    "estudio_id" INTEGER NOT NULL,
    "estacao_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "temporada" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "quantidadeEpisodios" INTEGER NOT NULL,
    "sinopse" VARCHAR(5000) NOT NULL,
    "capaUrl" TEXT NOT NULL,
    "estudioId" INTEGER,
    "estacaoId" INTEGER,
    "generoId" INTEGER,
    "statusId" INTEGER,
    "tagsId" INTEGER,
    "plataformaId" INTEGER,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "principaisObras" VARCHAR(5000) NOT NULL,

    CONSTRAINT "Estudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Estacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genero" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Genero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personagem" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idade_inicial" INTEGER NOT NULL,
    "sexo" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,
    "aniversario" TEXT NOT NULL,
    "altura_inicial" INTEGER NOT NULL,
    "afiliacao" TEXT NOT NULL,
    "sobre" VARCHAR(5000) NOT NULL,

    CONSTRAINT "Personagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeEstacao" (
    "anime_id" INTEGER NOT NULL,
    "estacao_id" INTEGER NOT NULL,

    CONSTRAINT "AnimeEstacao_pkey" PRIMARY KEY ("anime_id","estacao_id")
);

-- CreateTable
CREATE TABLE "AnimeEstudio" (
    "anime_id" INTEGER NOT NULL,
    "estudio_id" INTEGER NOT NULL,

    CONSTRAINT "AnimeEstudio_pkey" PRIMARY KEY ("anime_id","estudio_id")
);

-- CreateTable
CREATE TABLE "AnimeGenero" (
    "anime_id" INTEGER NOT NULL,
    "genero_id" INTEGER NOT NULL,

    CONSTRAINT "AnimeGenero_pkey" PRIMARY KEY ("anime_id","genero_id")
);

-- CreateTable
CREATE TABLE "AnimePersonagem" (
    "anime_id" INTEGER NOT NULL,
    "personagem_id" INTEGER NOT NULL,

    CONSTRAINT "AnimePersonagem_pkey" PRIMARY KEY ("anime_id","personagem_id")
);

-- CreateTable
CREATE TABLE "AnimePlataforma" (
    "anime_id" INTEGER NOT NULL,
    "plataforma_id" INTEGER NOT NULL,

    CONSTRAINT "AnimePlataforma_pkey" PRIMARY KEY ("anime_id","plataforma_id")
);

-- CreateTable
CREATE TABLE "AnimeTag" (
    "anime_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("anime_id","tag_id")
);

-- CreateTable
CREATE TABLE "capas" (
    "id" SERIAL NOT NULL,
    "nome_original" TEXT NOT NULL,
    "nome_salvo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,

    CONSTRAINT "capas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verificacao" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filtro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Filtro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudio_nome_key" ON "Estudio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Estacao_nome_key" ON "Estacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Genero_nome_key" ON "Genero"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Status_nome_key" ON "Status"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_nome_key" ON "Tags"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Plataforma_nome_key" ON "Plataforma"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_usuarioId_key" ON "Admin"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Filtro_nome_key" ON "Filtro"("nome");

-- AddForeignKey
ALTER TABLE "AnimeStatus" ADD CONSTRAINT "AnimeStatus_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeStatus" ADD CONSTRAINT "AnimeStatus_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_estacaoId_fkey" FOREIGN KEY ("estacaoId") REFERENCES "Estacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_tagsId_fkey" FOREIGN KEY ("tagsId") REFERENCES "Tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeEstacao" ADD CONSTRAINT "AnimeEstacao_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeEstacao" ADD CONSTRAINT "AnimeEstacao_estacao_id_fkey" FOREIGN KEY ("estacao_id") REFERENCES "Estacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeEstudio" ADD CONSTRAINT "AnimeEstudio_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeEstudio" ADD CONSTRAINT "AnimeEstudio_estudio_id_fkey" FOREIGN KEY ("estudio_id") REFERENCES "Estudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenero" ADD CONSTRAINT "AnimeGenero_genero_id_fkey" FOREIGN KEY ("genero_id") REFERENCES "Genero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePersonagem" ADD CONSTRAINT "AnimePersonagem_personagem_id_fkey" FOREIGN KEY ("personagem_id") REFERENCES "Personagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimePlataforma" ADD CONSTRAINT "AnimePlataforma_plataforma_id_fkey" FOREIGN KEY ("plataforma_id") REFERENCES "Plataforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTag" ADD CONSTRAINT "AnimeTag_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeTag" ADD CONSTRAINT "AnimeTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
