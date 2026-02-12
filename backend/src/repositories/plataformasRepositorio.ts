import { db } from '../db';
import { plataformas } from '../schema/plataformas';
import { animes } from '../schema/animes';
import { anime_plataforma } from '../schema/anime_plataforma';
import { eq, sql } from 'drizzle-orm';

import type {
  Plataforma,
  CriarPlataformaDTO,
  AtualizarPlataformaDTO,
} from '../types/plataforma';

import { normalizarTextoComparacao } from '../helpers/textHelpers';

function toPlataforma(row: typeof plataformas.$inferSelect): Plataforma {
  return {
    id: Number(row.id),
    nome: String(row.nome ?? ''),
  };
}

function matchNomePlataformaSQL(nome: string) {
  const normalizado = normalizarTextoComparacao(nome);
  return sql`replace(lower(${plataformas.nome}), ' ', '') = ${normalizado}`;
}

export const plataformaRepositorio = {
  async listar(): Promise<Plataforma[]> {
    const rows = await db.select().from(plataformas);
    return rows.map(toPlataforma);
  },

  async porId(id: number): Promise<Plataforma | undefined> {
    const [row] = await db
      .select()
      .from(plataformas)
      .where(eq(plataformas.id, id))
      .limit(1);

    return row ? toPlataforma(row) : undefined;
  },

  async porNome(nome: string): Promise<Plataforma | undefined> {
    const [row] = await db
      .select()
      .from(plataformas)
      .where(matchNomePlataformaSQL(nome))
      .limit(1);

    return row ? toPlataforma(row) : undefined;
  },

  animesPorPlataformaId(plataformaId: number) {
    return db
      .select()
      .from(animes)
      .innerJoin(anime_plataforma, eq(animes.id, anime_plataforma.anime_id))
      .where(eq(anime_plataforma.plataforma_id, plataformaId));
  },

  async criar(dados: CriarPlataformaDTO): Promise<Plataforma> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    const [row] = await db
      .insert(plataformas)
      .values({
        nome: nomeNormalizado,
      })
      .returning();

    return toPlataforma(row);
  },

  async atualizar(
    id: number,
    dados: AtualizarPlataformaDTO,
  ): Promise<Plataforma | undefined> {
    const atualizacao: Partial<typeof plataformas.$inferInsert> = {};
    if (dados.nome !== undefined) {
      atualizacao.nome = normalizarTextoComparacao(dados.nome);
    }
    const [row] = await db
      .update(plataformas)
      .set(atualizacao)
      .where(eq(plataformas.id, id))
      .returning();

    return row ? toPlataforma(row) : undefined;
  },

  async deletar(id: number): Promise<Plataforma | undefined> {
    const [row] = await db
      .delete(plataformas)
      .where(eq(plataformas.id, id))
      .returning();

    return row ? toPlataforma(row) : undefined;
  },
};
