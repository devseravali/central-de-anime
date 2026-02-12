import { db } from '../db';
import { tags } from '../schema/tags';
import { anime_tag } from '../schema/anime_tag';
import { eq, ilike } from 'drizzle-orm';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type { Tag, CriarTagDTO, AtualizarTagDTO } from '../types/tag';

export const tagsRepositorio = {
  async listar(): Promise<Tag[]> {
    const rows = await db.select().from(tags);
    return rows.map((row) => ({
      ...row,
      nome: normalizarTextoComparacao(row.nome),
    }));
  },

  async porId(id: number): Promise<Tag | null> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return tag ? { ...tag, nome: normalizarTextoComparacao(tag.nome) } : null;
  },

  async buscarPorNome(nome: string): Promise<Tag[]> {
    const nomeNormalizado = normalizarTextoComparacao(nome);
    const rows = await db.select().from(tags);
    return rows
      .filter((row) =>
        normalizarTextoComparacao(row.nome).includes(nomeNormalizado),
      )
      .map((row) => ({ ...row, nome: normalizarTextoComparacao(row.nome) }));
  },

  async criar(dados: CriarTagDTO): Promise<Tag> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    const [nova] = await db
      .insert(tags)
      .values({ ...dados, nome: nomeNormalizado })
      .returning();
    return { ...nova, nome: nomeNormalizado };
  },

  async atualizar(id: number, dados: AtualizarTagDTO): Promise<Tag | null> {
    const existente = await this.porId(id);
    if (!existente) return null;

    let nomeNormalizado: string | undefined = undefined;
    if (dados.nome !== undefined) {
      nomeNormalizado = normalizarTextoComparacao(dados.nome);
    }

    const [atualizada] = await db
      .update(tags)
      .set({
        ...dados,
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
      })
      .where(eq(tags.id, id))
      .returning();

    return atualizada
      ? { ...atualizada, nome: normalizarTextoComparacao(atualizada.nome) }
      : null;
  },

  async deletar(id: number): Promise<Tag | null> {
    const existente = await this.porId(id);
    if (!existente) return null;

    await db.delete(anime_tag).where(eq(anime_tag.tag_id, id));

    const [removida] = await db.delete(tags).where(eq(tags.id, id)).returning();

    return removida
      ? { ...removida, nome: normalizarTextoComparacao(removida.nome) }
      : null;
  },
};
