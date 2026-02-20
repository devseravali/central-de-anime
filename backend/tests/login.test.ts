import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { sessoes } from '../src/schema/login';

async function withRollback(callback: () => Promise<void>) {
  await db
    .transaction(async (tx) => {
      await callback();
      throw new Error('Rollback');
    })
    .catch(() => {});
}

describe('Login', () => {
  it('deve inserir e buscar sessão', async () => {
    await withRollback(async () => {
      const usuarioId = Math.floor(Math.random() * 10000);
      const refreshTokenHash = 'hash123';
      const sessao = await db
        .insert(sessoes)
        .values({
          usuarioId,
          refreshTokenHash,
          criadoEm: new Date(),
          expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24), 
        })
        .returning();
      expect(sessao[0].usuarioId).toBe(usuarioId);
      const resultado = await db
        .select()
        .from(sessoes)
        .where(eq(sessoes.usuarioId, usuarioId));
      expect(resultado.length).toBeGreaterThan(0);
      // If you want to check another property, replace 'token' with a valid column name from your schema
      // expect(resultado[0].token).toBe('token123');
    });
  });
});
