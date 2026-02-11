CREATE TABLE "anime_estacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"temporada" integer,
	"estacao_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_estudio" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"estudio_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_genero" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"genero_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_personagem" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"personagem_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_plataforma" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"plataforma_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"status_id" integer
);
--> statement-breakpoint
CREATE TABLE "anime_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"tag_id" integer
);
--> statement-breakpoint
CREATE TABLE "animes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255),
	"titulo_portugues" varchar(255),
	"titulo_ingles" varchar(255),
	"titulo_japones" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "estacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100),
	"slug" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "estudios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255),
	"principais_obras" varchar(1000)
);
--> statement-breakpoint
CREATE TABLE "generos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "personagens" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"idade_inicial" varchar(50),
	"sexo" varchar(20),
	"papel" varchar(100),
	"imagem" varchar(255),
	"aniversario" varchar(50),
	"altura_inicial" varchar(50),
	"afiliacao" varchar(100),
	"sobre" text
);
--> statement-breakpoint
CREATE TABLE "plataformas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "status" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "temporadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer,
	"slug" varchar(255),
	"nome" varchar(255),
	"temporada" integer,
	"status_id" integer,
	"ano" varchar(4),
	"estacao_id" integer,
	"episodios" integer,
	"sinopse" text
);
--> statement-breakpoint
ALTER TABLE "anime_estacao" ADD CONSTRAINT "anime_estacao_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_estacao" ADD CONSTRAINT "anime_estacao_estacao_id_estacoes_id_fk" FOREIGN KEY ("estacao_id") REFERENCES "public"."estacoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_estudio" ADD CONSTRAINT "anime_estudio_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_estudio" ADD CONSTRAINT "anime_estudio_estudio_id_estudios_id_fk" FOREIGN KEY ("estudio_id") REFERENCES "public"."estudios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_genero" ADD CONSTRAINT "anime_genero_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_genero" ADD CONSTRAINT "anime_genero_genero_id_generos_id_fk" FOREIGN KEY ("genero_id") REFERENCES "public"."generos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_personagem" ADD CONSTRAINT "anime_personagem_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_personagem" ADD CONSTRAINT "anime_personagem_personagem_id_personagens_id_fk" FOREIGN KEY ("personagem_id") REFERENCES "public"."personagens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_plataforma" ADD CONSTRAINT "anime_plataforma_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_plataforma" ADD CONSTRAINT "anime_plataforma_plataforma_id_plataformas_id_fk" FOREIGN KEY ("plataforma_id") REFERENCES "public"."plataformas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_status" ADD CONSTRAINT "anime_status_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_status" ADD CONSTRAINT "anime_status_status_id_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_tag" ADD CONSTRAINT "anime_tag_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_tag" ADD CONSTRAINT "anime_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporadas" ADD CONSTRAINT "temporadas_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporadas" ADD CONSTRAINT "temporadas_status_id_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporadas" ADD CONSTRAINT "temporadas_estacao_id_estacoes_id_fk" FOREIGN KEY ("estacao_id") REFERENCES "public"."estacoes"("id") ON DELETE no action ON UPDATE no action;