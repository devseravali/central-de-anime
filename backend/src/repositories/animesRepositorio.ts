import { db } from '../db';
import { animes } from '../schema/animes';
import { eq, and, isNotNull } from 'drizzle-orm';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import { Anime } from '../types/relacoes';

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

  async listarTemporadas(): Promise<string[]> {
    const temporadas = await db
      .selectDistinct({ temporada: animes.temporada })
      .from(animes)
      .where(isNotNull(animes.temporada));
    return (
      temporadas.map((item) => item.temporada) as (string | null | undefined)[]
    ).filter((t): t is string => typeof t === 'string' && t.length > 0);
  },

  async animesTitulos(): Promise<Anime[]> {
    const todos = await db.select().from(animes);
    return (todos as Anime[]).filter((anime) => {
      return (
        (anime.titulo && normalizarTextoComparacao(anime.titulo).length > 0) ||
        (anime.titulo && normalizarTextoComparacao(anime.titulo).length > 0)
      );
    }) as Anime[];
  },

  async animesNomes(): Promise<string[]> {
    const nomes = await db.select({ nome: animes.titulo }).from(animes);
    return nomes.map((item) => normalizarTextoComparacao(item.nome));
  },

  async animesPorId(id: string): Promise<Anime | null> {
    const resultado: Anime[] = await db
      .select()
      .from(animes)
      .where(eq(animes.id, Number(id)));
    return resultado.length > 0 ? resultado[0] : null;
  },

  async adicionarAnime(anime: Omit<Anime, 'id'>): Promise<Anime | null> {
    const valores = {
      anime_id: anime.anime_id,
      slug: anime.slug,
      titulo: anime.titulo,
      estudio_id: anime.estudio_id,
      tipo: anime.tipo,
      temporada: anime.temporada,
      status_id: anime.status_id,
      ano: anime.ano,
      estacao_id: anime.estacao_id,
      episodios: anime.episodios,
      sinopse: anime.sinopse,
      capaUrl: anime.capaUrl,
    };
    console.log('Valores inseridos no banco:', valores);
    const [novoAnime] = await db.insert(animes).values(valores).returning();
    console.log('Registro retornado pelo banco após inserção:', novoAnime);
    if (!novoAnime) {
      return null;
    }
    console.log(`Anime adicionado: ${novoAnime.titulo}`);
    return novoAnime;
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
      console.log(`Anime deletado: ${animeDeletado.titulo}`);
    }
    return animeDeletado ? (animeDeletado as Anime) : null;
  },
};
