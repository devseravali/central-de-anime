import { index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

export const auditAcoesEnum = pgEnum('audit_acao', [
  'login_falhou',
  'login_sucesso',
  'logout',

  'usuario_suspender',
  'usuario_banir',
  'usuario_reativar',
  'usuario_trocar_role',

  'conteudo_aprovar',
  'conteudo_rejeitar',
  'conteudo_remover',
]);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),


    atorUsuarioId: integer('ator_usuario_id').references(() => usuarios.id),

    alvoUsuarioId: integer('alvo_usuario_id').references(() => usuarios.id),

    acao: auditAcoesEnum('acao').notNull(),

    detalhes: text('detalhes'),

    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (t) => ({
    atorIdx: index('audit_logs_ator_idx').on(t.atorUsuarioId),
    alvoIdx: index('audit_logs_alvo_idx').on(t.alvoUsuarioId),
    acaoIdx: index('audit_logs_acao_idx').on(t.acao),
  }),
);
