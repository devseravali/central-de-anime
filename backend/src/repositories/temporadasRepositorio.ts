import { db } from '../db';
import { temporadas } from '../schema/temporadas';
import { eq, and } from 'drizzle-orm';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type {
  TemporadaAtualizacaoDTO,
  TemporadaCriacaoDTO,
} from '../types/dtos/temporadaDTO';

export const temporadasRepositorio = {
  listarTemporadas({ pagina = 1, limite = 20 } = {}) {
    const offset = (pagina - 1) * limite;
    return db
      .select()
      .from(temporadas)
      .limit(limite)
      .offset(offset)
      .then((rows: any[]) =>
        rows.map((row: any) =>
          row.nome !== undefined && row.nome !== null
            ? { ...row, nome: normalizarTextoComparacao(String(row.nome)) }
            : { ...row, nome: '' },
        ),
      );
  },

  listarTemporadasPorAnime(animeId: number) {
    return db
      .select()
      .from(temporadas)
      .where(eq(temporadas.anime_id, animeId))
      .then((rows) =>
        rows.map((row) =>
          row.nome !== undefined && row.nome !== null
            ? { ...row, nome: normalizarTextoComparacao(String(row.nome)) }
            : { ...row, nome: '' },
        ),
      );
  },

  listarTemporadasPorAnimeETemporada(animeId: number, temporada: number) {
    return db
      .select()
      .from(temporadas)
      .where(
        and(
          eq(temporadas.anime_id, animeId),
          eq(temporadas.temporada, temporada),
        ),
      )
      .then((rows) =>
        rows.map((row) =>
          row.nome !== undefined && row.nome !== null
            ? { ...row, nome: normalizarTextoComparacao(String(row.nome)) }
            : { ...row, nome: '' },
        ),
      );
  },

  buscarTemporadaPorId(id: number) {
    return db
      .select()
      .from(temporadas)
      .where(eq(temporadas.id, id))
      .then((res: any[]) => {
        const row: any = res[0] ?? null;
        if (row && row.nome !== undefined && row.nome !== null) {
          return { ...row, nome: normalizarTextoComparacao(String(row.nome)) };
        }
        if (row) {
          return { ...row, nome: '' };
        }
        return row;
      });
  },

  buscarTemporadasPorNumero(numero: number) {
    return db
      .select()
      .from(temporadas)
      .where(eq(temporadas.temporada, numero))
      .then((rows) =>
        rows.map((row) =>
          row.nome !== undefined && row.nome !== null
            ? { ...row, nome: normalizarTextoComparacao(String(row.nome)) }
            : { ...row, nome: '' },
        ),
      );
  },

  criarTemporada(data: TemporadaCriacaoDTO) {
    const nomeNormalizado =
      data.nome !== undefined && data.nome !== null
        ? normalizarTextoComparacao(String(data.nome))
        : undefined;
    return db
      .insert(temporadas)
      .values({
        ...data,
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
        ano: String(data.ano),
      })
      .returning()
      .then((rows) =>
        rows.map((row) =>
          row.nome !== undefined && row.nome !== null
            ? { ...row, nome: normalizarTextoComparacao(String(row.nome)) }
            : { ...row, nome: '' },
        ),
      );
  },

  atualizarTemporada(id: number, data: TemporadaAtualizacaoDTO) {
    const nomeNormalizado =
      data.nome !== undefined && data.nome !== null
        ? normalizarTextoComparacao(String(data.nome))
        : undefined;
    return db
      .update(temporadas)
      .set({
        ...data,
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
        ...(data.ano !== undefined ? { ano: String(data.ano) } : {}),
      } as Partial<typeof temporadas.$inferInsert>)
      .where(eq(temporadas.id, id))
      .returning()
      .then((res) => {
        const row = res[0] ?? null;
        if (row && row.nome !== undefined && row.nome !== null) {
          return { ...row, nome: normalizarTextoComparacao(String(row.nome)) };
        }
        if (row) {
          return { ...row, nome: '' };
        }
        return row;
      });
  },

  deletarTemporada(id: number) {
    return db
      .delete(temporadas)
      .where(eq(temporadas.id, id))
      .returning()
      .then((res) => {
        const row = res[0] ?? null;
        if (row && row.nome !== undefined && row.nome !== null) {
          return { ...row, nome: normalizarTextoComparacao(String(row.nome)) };
        }
        if (row) {
          return { ...row, nome: '' };
        }
        return row;
      });
  },
};
