CREATE TYPE "public"."audit_acao" AS ENUM('login_falhou', 'login_sucesso', 'logout', 'usuario_suspender', 'usuario_banir', 'usuario_reativar', 'usuario_trocar_role', 'conteudo_aprovar', 'conteudo_rejeitar', 'conteudo_remover');--> statement-breakpoint
CREATE TYPE "public"."sancao_tipo" AS ENUM('suspensao', 'banimento');--> statement-breakpoint
CREATE TYPE "public"."usuario_status" AS ENUM('ativo', 'pendente', 'suspenso', 'banido');--> statement-breakpoint
CREATE TABLE "permissoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"chave" varchar(80) NOT NULL,
	"descricao" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "role_permissoes" (
	"role_id" integer NOT NULL,
	"permissao_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"descricao" varchar(255),
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario_roles" (
	"usuario_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"atribuido_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_estacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"estacao_id" integer NOT NULL
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
	"anime_id" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"estudio_id" integer NOT NULL,
	"tipo" varchar(32) NOT NULL,
	"temporada" integer,
	"status_id" integer,
	"ano" integer,
	"estacao_id" integer,
	"episodios" integer,
	"sinopse" varchar(2048),
	"capaUrl" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ator_usuario_id" integer,
	"alvo_usuario_id" integer,
	"acao" "audit_acao" NOT NULL,
	"detalhes" text,
	"ip" varchar(45),
	"user_agent" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome_original" varchar(255) NOT NULL,
	"nome_salvo" varchar(255) NOT NULL,
	"caminho" varchar(255) NOT NULL,
	"mimetype" varchar(100) NOT NULL,
	"tamanho" integer NOT NULL,
	"usuario_id" integer,
	"data_upload" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estudios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255),
	"principais_obras" varchar(1000) DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	CONSTRAINT "generos_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"dispositivo" varchar(120),
	"ip" varchar(45),
	"user_agent" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"expira_em" timestamp NOT NULL,
	"revogado_em" timestamp
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
	"sobre" text DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plataformas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resets_senha" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expira_em" timestamp NOT NULL,
	"usado_em" timestamp,
	"ip_solicitacao" varchar(45),
	"user_agent" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100) DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sancoes_usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"tipo" "sancao_tipo" NOT NULL,
	"motivo" varchar(255) NOT NULL,
	"expira_em" timestamp,
	"aplicado_por_usuario_id" integer,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"revogado_em" timestamp,
	"revogado_por_usuario_id" integer
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes_usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expira_em" timestamp NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha_hash" varchar(255) NOT NULL,
	"status" "usuario_status" DEFAULT 'pendente' NOT NULL,
	"email_verificado" boolean DEFAULT false NOT NULL,
	"username" varchar(40),
	"avatar_url" text,
	"bio" varchar(160),
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificacoes_email" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expira_em" timestamp NOT NULL,
	"usado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissoes" ADD CONSTRAINT "role_permissoes_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissoes" ADD CONSTRAINT "role_permissoes_permissao_id_permissoes_id_fk" FOREIGN KEY ("permissao_id") REFERENCES "public"."permissoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_estacao" ADD CONSTRAINT "anime_estacao_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_estacao" ADD CONSTRAINT "anime_estacao_estacao_id_estacoes_id_fk" FOREIGN KEY ("estacao_id") REFERENCES "public"."estacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "animes" ADD CONSTRAINT "animes_estudio_id_estudios_id_fk" FOREIGN KEY ("estudio_id") REFERENCES "public"."estudios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_ator_usuario_id_usuarios_id_fk" FOREIGN KEY ("ator_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_alvo_usuario_id_usuarios_id_fk" FOREIGN KEY ("alvo_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resets_senha" ADD CONSTRAINT "resets_senha_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sancoes_usuarios" ADD CONSTRAINT "sancoes_usuarios_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sancoes_usuarios" ADD CONSTRAINT "sancoes_usuarios_aplicado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("aplicado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sancoes_usuarios" ADD CONSTRAINT "sancoes_usuarios_revogado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("revogado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_usuario" ADD CONSTRAINT "sessoes_usuario_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificacoes_email" ADD CONSTRAINT "verificacoes_email_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permissoes_chave_unica" ON "permissoes" USING btree ("chave");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissoes_unico" ON "role_permissoes" USING btree ("role_id","permissao_id");--> statement-breakpoint
CREATE INDEX "role_permissoes_role_idx" ON "role_permissoes" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissoes_permissao_idx" ON "role_permissoes" USING btree ("permissao_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_nome_unico" ON "roles" USING btree ("nome");--> statement-breakpoint
CREATE UNIQUE INDEX "usuario_roles_unico" ON "usuario_roles" USING btree ("usuario_id","role_id");--> statement-breakpoint
CREATE INDEX "usuario_roles_usuario_idx" ON "usuario_roles" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "usuario_roles_role_idx" ON "usuario_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "anime_estacao_unico" ON "anime_estacao" USING btree ("anime_id","estacao_id");--> statement-breakpoint
CREATE INDEX "anime_estacao_anime_idx" ON "anime_estacao" USING btree ("anime_id");--> statement-breakpoint
CREATE INDEX "anime_estacao_estacao_idx" ON "anime_estacao" USING btree ("estacao_id");--> statement-breakpoint
CREATE INDEX "animes_estudio_idx" ON "animes" USING btree ("estudio_id");--> statement-breakpoint
CREATE INDEX "animes_anime_id_idx" ON "animes" USING btree ("anime_id");--> statement-breakpoint
CREATE INDEX "animes_status_idx" ON "animes" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "animes_estacao_idx" ON "animes" USING btree ("estacao_id");--> statement-breakpoint
CREATE INDEX "audit_logs_ator_idx" ON "audit_logs" USING btree ("ator_usuario_id");--> statement-breakpoint
CREATE INDEX "audit_logs_alvo_idx" ON "audit_logs" USING btree ("alvo_usuario_id");--> statement-breakpoint
CREATE INDEX "audit_logs_acao_idx" ON "audit_logs" USING btree ("acao");--> statement-breakpoint
CREATE UNIQUE INDEX "estacoes_slug_unico" ON "estacoes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessoes_usuario_idx" ON "sessoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "sessoes_expira_idx" ON "sessoes" USING btree ("expira_em");--> statement-breakpoint
CREATE UNIQUE INDEX "resets_senha_token_unico" ON "resets_senha" USING btree ("token");--> statement-breakpoint
CREATE INDEX "resets_senha_usuario_idx" ON "resets_senha" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "sancoes_usuarios_usuario_idx" ON "sancoes_usuarios" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "sancoes_usuarios_tipo_idx" ON "sancoes_usuarios" USING btree ("tipo");--> statement-breakpoint
CREATE UNIQUE INDEX "sessoes_usuario_token_unico" ON "sessoes_usuario" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessoes_usuario_usuario_idx" ON "sessoes_usuario" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_unico" ON "usuarios" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_username_unico" ON "usuarios" USING btree ("username");--> statement-breakpoint
CREATE INDEX "usuarios_status_idx" ON "usuarios" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "verificacoes_email_token_unico" ON "verificacoes_email" USING btree ("token");--> statement-breakpoint
CREATE INDEX "verificacoes_email_usuario_idx" ON "verificacoes_email" USING btree ("usuario_id");