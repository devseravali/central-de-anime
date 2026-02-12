import { db } from '../db';
import { animes } from '../schema/animes';
import { eq, and, isNotNull } from 'drizzle-orm';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type { Anime } from '../types/anime';

export const animesRepositorio = {
  async animes({
    pagina = 1,
    limite = 20,
  }: { pagina?: number; limite?: number } = {}): Promise<Anime[]> {
    const offset = (pagina - 1) * limite;
    const animesExistentes = await db
      .select()
      .from(animes)
      .limit(limite)
      .offset(offset);
    return animesExistentes as Anime[];
  },

  async animesTitulos(): Promise<Anime[]> {
    const todos = await db.select().from(animes);
    return (todos as Anime[]).filter((anime) => {
      return (
        (anime.titulo_portugues &&
          normalizarTextoComparacao(anime.titulo_portugues).length > 0) ||
        (anime.titulo_ingles &&
          normalizarTextoComparacao(anime.titulo_ingles).length > 0) ||
        (anime.titulo_japones &&
          normalizarTextoComparacao(anime.titulo_japones).length > 0)
      );
    });
  },

  async animesNomes(): Promise<string[]> {
    const nomes = await db.select({ nome: animes.nome }).from(animes);
    return nomes.map((item) => normalizarTextoComparacao(item.nome));
  },

  async animesPorId(id: string): Promise<Anime | null> {
    const [anime] = await db
      .select()
      .from(animes)
      .where(eq(animes.id, Number(id)));
    return anime ? (anime as Anime) : null;
  },

  async adicionarAnime(anime: Omit<Anime, 'id'>): Promise<Anime | null> {
    const valores: Omit<Anime, 'id'> = { ...anime };
    const [novoAnime] = await db.insert(animes).values(valores).returning();
    if (!novoAnime) {
      return null;
    }
    console.log(`Anime adicionado: ${novoAnime.nome}`);
    return novoAnime as Anime;
  },
  async atualizarAnime(
    id: string,
    dadosAtualizados: Partial<Omit<Anime, 'id'>>,
  ): Promise<Anime | null> {
    const [animeAtualizado] = await db
      .update(animes)
      .set(dadosAtualizados)
      .where(eq(animes.id, Number(id)))
      .returning();
    return animeAtualizado ? (animeAtualizado as Anime) : null;
  },

  async deletarAnime(id: string): Promise<Anime | null> {
    const [animeDeletado] = await db
      .delete(animes)
      .where(eq(animes.id, Number(id)))
      .returning();
    if (animeDeletado) {
      console.log(`Anime deletado: ${animeDeletado.nome}`);
    }
    return animeDeletado ? (animeDeletado as Anime) : null;
  },
};
