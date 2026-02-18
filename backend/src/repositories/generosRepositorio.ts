import { db } from '../db';
import { generos } from '../schema/generos';
import { animes } from '../schema/animes';
import { anime_genero } from '../schema/anime_genero';
import { eq, sql } from 'drizzle-orm';
import type {
  Genero,
  CriarGeneroDTO,
  AtualizarGeneroDTO,
} from '../types/genero';
import { normalizarTextoComparacao } from '../helpers/textHelpers';

function matchNomeGeneroSQL(nome: string) {
  const normalizado = normalizarTextoComparacao(nome);
  return sql`replace(lower(${generos.nome}), ' ', '') = ${normalizado}`;
}

export const generosRepositorio = {
  listar({ pagina = 1, limite = 20 } = {}): Promise<Genero[]> {
    const offset = (pagina - 1) * limite;
    return db.select().from(generos).limit(limite).offset(offset) as Promise<
      Genero[]
    >;
  },

  async porId(id: number): Promise<Genero | undefined> {
    const [genero] = await db
      .select()
      .from(generos)
      .where(eq(generos.id, id))
      .limit(1);

    return genero as Genero | undefined;
  },

  async porNome(nome: string): Promise<Genero | undefined> {
    const [genero] = await db
      .select()
      .from(generos)
      .where(matchNomeGeneroSQL(nome))
      .limit(1);

    return genero as Genero | undefined;
  },

  async criar(dados: CriarGeneroDTO): Promise<Genero> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    const [novo] = await db
      .insert(generos)
      .values({
        nome: nomeNormalizado,
      })
      .returning();
    return novo as Genero;
  },

  async atualizar(
    id: number,
    dados: AtualizarGeneroDTO,
  ): Promise<Genero | undefined> {
    const atualizacao: AtualizarGeneroDTO = { ...dados };
    if (dados.nome !== undefined) {
      atualizacao.nome = normalizarTextoComparacao(dados.nome);
    }
    const [atualizado] = await db
      .update(generos)
      .set(atualizacao)
      .where(eq(generos.id, id))
      .returning();
    return atualizado as Genero | undefined;
  },

  async deletar(id: number): Promise<Genero | undefined> {
    await db.delete(anime_genero).where(eq(anime_genero.genero_id, id));

    const [deletado] = await db
      .delete(generos)
      .where(eq(generos.id, id))
      .returning();

    return deletado as Genero | undefined;
  },

  animesPorGeneroId(id: number): Promise<(typeof animes.$inferSelect)[]> {
    return db
      .select({
        id: animes.id,
        anime_id: animes.anime_id,
        estudio_id: animes.estudio_id,
        slug: animes.slug,
        titulo: animes.titulo,
        tipo: animes.tipo,
        temporada: animes.temporada,
        status_id: animes.status_id,
        ano: animes.ano,
        estacao_id: animes.estacao_id,
        episodios: animes.episodios,
        sinopse: animes.sinopse,
        capaUrl: animes.capaUrl,
      })
      .from(animes)
      .innerJoin(anime_genero, eq(animes.id, anime_genero.anime_id))
      .where(eq(anime_genero.genero_id, id));
  },

  async animesPorNomeGenero(
    nome: string,
  ): Promise<(typeof animes.$inferSelect)[]> {
    const genero = await this.porNome(nome);
    if (!genero) return [];
    return this.animesPorGeneroId(genero.id);
  },
};
