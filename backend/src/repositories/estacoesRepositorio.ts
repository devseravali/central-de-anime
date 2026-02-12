import { db } from '../db';
import { estacoes } from '../schema/estacoes';
import { eq } from 'drizzle-orm';
import type { Estacao } from '../types/estacao';
import { normalizarTextoComparacao } from '../helpers/textHelpers';

export const estacoesRepositorio = {
  async listarTodos(): Promise<Estacao[]> {
    const rows = await db.select().from(estacoes);
    return rows as Estacao[];
  },

  async listarEstacaoPorId(id: number): Promise<Estacao | null> {
    const [estacao] = await db
      .select()
      .from(estacoes)
      .where(eq(estacoes.id, id))
      .limit(1);
    return estacao ? (estacao as Estacao) : null;
  },

  async listarEstacaoPorNome(nome: string): Promise<Estacao | null> {
    const todas = await db.select().from(estacoes);
    const termo = normalizarTextoComparacao(nome);
    const estacao = todas.find(
      (e) => normalizarTextoComparacao(e.nome) === termo,
    );
    return estacao ? (estacao as Estacao) : null;
  },

  async adicionarEstacao(nome: string, slug: string): Promise<Estacao> {
    const [novaEstacao] = await db
      .insert(estacoes)
      .values({ nome, slug })
      .returning();
    return novaEstacao as Estacao;
  },

  async atualizarEstacao(id: number, nome: string): Promise<Estacao | null> {
    const [estacaoAtualizada] = await db
      .update(estacoes)
      .set({ nome })
      .where(eq(estacoes.id, id))
      .returning();
    return estacaoAtualizada ? (estacaoAtualizada as Estacao) : null;
  },

  async removerEstacao(id: number): Promise<void> {
    await db.delete(estacoes).where(eq(estacoes.id, id));
  },
};
