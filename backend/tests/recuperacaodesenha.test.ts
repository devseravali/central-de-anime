import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { resetsSenha } from '../src/schema/recuperacaodesenha';

async function withRollback(callback: () => Promise<void>) {
  await db
    .transaction(async (tx) => {
      await callback();
      throw new Error('Rollback');
    })
    .catch(() => {});
}

describe('Recuperacao de Senha', () => {
  it('deve inserir e buscar reset de senha', async () => {
    await withRollback(async () => {
      const usuarioId = 1;
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000);
      const token = `abc123-${Date.now()}`;
      const reset = await db
        .insert(resetsSenha)
        .values({
          usuarioId,
          token,
          expiraEm,
          criadoEm: new Date(),
        })
        .returning();
      expect(reset[0].token).toBe(token);
      const resultado = await db
        .select()
        .from(resetsSenha)
        .where(eq(resetsSenha.token, token));
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado[0].token).toBe(token);
    });
  });

  it('deve registrar metadados de solicitacao', async () => {
    await withRollback(async () => {
      const usuarioId = 1;
      const token = `meta-${Date.now()}`;
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(resetsSenha).values({
        usuarioId,
        token,
        expiraEm,
        ipSolicitacao: '127.0.0.1',
        userAgent: 'vitest',
        criadoEm: new Date(),
      });

      const resultado = await db
        .select()
        .from(resetsSenha)
        .where(eq(resetsSenha.token, token));
      expect(resultado.length).toBe(1);
      expect(resultado[0].ipSolicitacao).toBe('127.0.0.1');
      expect(resultado[0].userAgent).toBe('vitest');
    });
  });

  it('deve impedir token duplicado', async () => {
    await withRollback(async () => {
      const usuarioId = 1;
      const token = `dup-${Date.now()}`;
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(resetsSenha).values({
        usuarioId,
        token,
        expiraEm,
        criadoEm: new Date(),
      });

      let erroDuplicado = false;
      try {
        await db.insert(resetsSenha).values({
          usuarioId,
          token,
          expiraEm,
          criadoEm: new Date(),
        });
      } catch {
        erroDuplicado = true;
      }

      expect(erroDuplicado).toBe(true);
    });
  });
});
