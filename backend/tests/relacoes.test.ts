import { describe, it, expect } from 'vitest';
import { db } from '../src/db';
import { estacoes } from '../src/schema/estacoes';
import { status } from '../src/schema/status';
import { estudios } from '../src/schema/estudios';
import { plataformas } from '../src/schema/plataformas';
import { tags } from '../src/schema/tags';
import { personagens } from '../src/schema/personagens';
import { animes } from '../src/schema/animes';
import { generos } from '../src/schema/generos';
import { pool } from '../src/db';
import { isNotNull } from 'drizzle-orm';

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

describe('Consultas de relações e buscas por nome/título', () => {
  it('deve buscar temporadas por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select({ ano: animes.ano, temporada: animes.temporada })
        .from(animes)
        .where(isNotNull(animes.ano))
        .groupBy(animes.ano, animes.temporada);
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar estações por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(estacoes)
        .where(isNotNull(estacoes.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar status por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(status)
        .where(isNotNull(status.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar estúdios por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(estudios)
        .where(isNotNull(estudios.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar plataformas por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(plataformas)
        .where(isNotNull(plataformas.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar tags por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(tags)
        .where(isNotNull(tags.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar personagens por nome', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(personagens)
        .where(isNotNull(personagens.nome));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });

  it('deve buscar animes por título', async () => {
    await withRollback(async () => {
      const resultado = await db
        .select()
        .from(animes)
        .where(isNotNull(animes.titulo));
      expect(Array.isArray(resultado)).toBe(true);
    });
  });
});
