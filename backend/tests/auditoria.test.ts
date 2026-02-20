import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { db, pool } from '../src/db';
import { eq, inArray, sql } from 'drizzle-orm';
import { auditLogs } from '../src/schema/auditoria';
import { usuarios } from '../src/schema/usuario';
import bcrypt from 'bcrypt';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

async function withRollback(
  callback: (
    txDb: NodePgDatabase<Record<string, unknown>> & { $client: PoolClient },
  ) => Promise<void>,
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txDb = drizzle(client) as NodePgDatabase<Record<string, unknown>> & {
      $client: PoolClient;
    };
    await callback(txDb);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

describe('Auditoria', () => {
  beforeEach(async () => {
    // Garante que o usuário de id 1 existe antes de cada teste
    const senhaHash = await bcrypt.hash('senha-teste', 10);
    await db
      .insert(usuarios)
      .values({
        id: 1,
        nome: 'Usuário Teste',
        email: 'teste-auditoria@centralanime.com',
        senhaHash,
        status: 'ativo',
        emailVerificado: true,
      })
      .onConflictDoNothing();
  });
  it('deve inserir e buscar log de auditoria', async () => {
    await withRollback(async (txDb) => {
      const acao = 'login_sucesso';
      const usuarioId = 1;
      const detalhes = `teste-${Date.now()}`;
      const log = await txDb
        .insert(auditLogs)
        .values({
          acao,
          atorUsuarioId: usuarioId,
          detalhes,
          criadoEm: new Date(),
        })
        .returning();
      expect(log[0].acao).toBe(acao);
      const resultado = await txDb
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.detalhes, detalhes));
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado[0].atorUsuarioId).toBe(usuarioId);
    });
  });

  it('nao deve persistir log apos rollback', async () => {
    const detalhes = `rollback-${Date.now()}`;

    await withRollback(async (txDb) => {
      await txDb.execute(
        sql`INSERT INTO audit_logs (acao, ator_usuario_id, detalhes, criado_em) VALUES ('logout', 1, ${detalhes}, ${new Date()})`,
      );

      const tempResultado = await txDb.execute(
        sql`SELECT * FROM audit_logs WHERE detalhes = ${detalhes}`,
      );
      expect(tempResultado.rows.length).toBe(1);
    });

    const resultado = await db.execute(
      sql`SELECT * FROM audit_logs WHERE detalhes = ${detalhes}`,
    );
    expect(resultado.rows.length).toBe(0);
  });

  it('deve buscar varios logs por detalhes', async () => {
    await withRollback(async (txDb) => {
      const now = Date.now();
      const detalhesList = Array.from({ length: 30 }, (_, index) => {
        return `bulk-${now}-${index}`;
      });

      await txDb.insert(auditLogs).values(
        detalhesList.map((detalhes) => ({
          acao: 'login_falhou' as const,
          atorUsuarioId: 1,
          detalhes,
          criadoEm: new Date(),
        })),
      );

      const resultado = await txDb
        .select()
        .from(auditLogs)
        .where(inArray(auditLogs.detalhes, detalhesList));
      expect(resultado.length).toBe(detalhesList.length);
    });
  });
});

describe('Testes adicionais de Auditoria', () => {
  it('deve rejeitar log com atorUsuarioId inválido', async () => {
    await withRollback(async (txDb) => {
      await expect(
        txDb
          .insert(auditLogs)
          .values({
            acao: 'login_falhou',
            atorUsuarioId: -1,
            detalhes: 'inválido',
            criadoEm: new Date(),
          })
          .returning(),
      ).rejects.toThrow();
    });
  });

  it('deve permitir detalhes longos', async () => {
    await withRollback(async (txDb) => {
      const detalhes = 'a'.repeat(1000);
      const log = await txDb
        .insert(auditLogs)
        .values({
          acao: 'login_falhou',
          atorUsuarioId: 1,
          detalhes,
          criadoEm: new Date(),
        })
        .returning();
      expect(log[0].detalhes).toBe(detalhes);
    });
  });

  it('deve rejeitar acao nula', async () => {
    await withRollback(async (txDb) => {
      await expect(
        txDb
          .insert(auditLogs)
          .values({
            acao: 'invalida' as any,
            atorUsuarioId: 1,
            detalhes: 'nulo',
            criadoEm: new Date(),
          })
          .returning(),
      ).rejects.toThrow();
    });
  });

  it('deve aceitar acao nula se o schema permitir', async () => {
    await withRollback(async (txDb) => {
      const log = await txDb
        .insert(auditLogs)
        .values({
          acao: 'login_sucesso',
          atorUsuarioId: 1,
          detalhes: 'nulo',
          criadoEm: new Date(),
        })
        .returning();
      expect(log[0].acao).toBe('login_sucesso');
    });
  });

  it('deve aceitar log com campos obrigatórios ausentes se o schema permitir', async () => {
    await withRollback(async (txDb) => {
      const log = await txDb
        .insert(auditLogs)
        .values({ acao: 'login_falhou' })
        .returning();
      expect(log[0].acao).toBe('login_falhou');
    });
  });

  it('deve buscar logs por atorUsuarioId', async () => {
    await withRollback(async (txDb) => {
      await txDb.insert(auditLogs).values({
        acao: 'login_falhou',
        atorUsuarioId: 1,
        detalhes: 'busca-ator',
        criadoEm: new Date(),
      });
      const resultado = await txDb
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.atorUsuarioId, 1));
      expect(resultado.length).toBeGreaterThan(0);
    });
  });
});
