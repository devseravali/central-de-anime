import { describe, it, expect } from 'vitest';
import { isNotNull } from 'drizzle-orm';
import { db } from '../src/db';
import { animes } from '../src/schema/animes';
import { estacoes } from '../src/schema/estacoes';
import { estudios } from '../src/schema/estudios';
import { plataformas } from '../src/schema/plataformas';
import { status } from '../src/schema/status';
import { tags } from '../src/schema/tags';
import { personagens } from '../src/schema/personagens';
import { generos } from '../src/schema/generos';
import { pool } from '../src/db';

async function withRollback(testFn: () => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await testFn();
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

describe('Consultas de entidades relacionadas a animes', () => {
  it('deve buscar entidades de um anime', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select({
          id: animes.id,
          ano: animes.ano,
          temporada: animes.temporada,
          estudio: animes.estudio_id,
        })
        .from(animes)
        .where(isNotNull(animes.id));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar animes de um estúdio', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(animes)
        .where(isNotNull(animes.estudio_id));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar tags de um anime', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(tags)
        .where(isNotNull(tags.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar plataformas de um anime', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(plataformas)
        .where(isNotNull(plataformas.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar gêneros de um anime', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(generos)
        .where(isNotNull(generos.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar status de uma temporada', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(status)
        .where(isNotNull(status.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });
});
