import { db } from '../db';
import { animes } from '../schema/animes';
import { estudios } from '../schema/estudios';
import { eq } from 'drizzle-orm';
import type { Estudio, AtualizarEstudioDTO } from '../types/estudio';
import { normalizarTextoComparacao } from '../helpers/textHelpers';

type ErrorWithCode = Error & { code?: string };
const isErrorWithCode = (err: Error): err is ErrorWithCode =>
  'code' in err && typeof (err as ErrorWithCode).code === 'string';

export const estudiosRepositorio = {
  async estudioPorNome(nome: string) {
    const nomeNormalizado = normalizarTextoComparacao(nome);

    const estudiosExistentes = await db.select().from(estudios);
    return estudiosExistentes.find((e) => {
      if (!e.nome) return false;
      const nomeEstudioNormalizado = normalizarTextoComparacao(e.nome);
      return nomeEstudioNormalizado === nomeNormalizado;
    });
  },
  async estudios({ pagina = 1, limite = 20 } = {}) {
    const offset = (pagina - 1) * limite;
    return await db.select().from(estudios).limit(limite).offset(offset);
  },

  async estudioPorId(id: string) {
    const [estudioExistente] = await db
      .select()
      .from(estudios)
      .where(eq(estudios.id, Number(id)));
    return estudioExistente;
  },

  async estudioPrincipaisObrasPorNome(nome: string) {
    const estudio = await this.estudioPorNome(nome);
    if (!estudio) {
      return [];
    }
    return await db
      .select()
      .from(animes)
      .where(eq(animes.estudio_id, estudio.id));
  },

  async animesPorEstudios(id: string) {
    return await db
      .select()
      .from(animes)
      .where(eq(animes.estudio_id, Number(id)));
  },

  async adicionarEstudio(estudio: { nome: string; principaisObras: string }) {
    try {
      const [novoEstudio] = await db
        .insert(estudios)
        .values({
          nome: estudio.nome,
          principaisObras: estudio.principaisObras,
        })
        .returning();
      return novoEstudio;
    } catch (err) {
      if (
        err instanceof Error &&
        isErrorWithCode(err) &&
        err.code === '23505'
      ) {
        const { ErroApi } = await import('../errors/ErroApi');
        throw ErroApi.conflict('Estúdio já existe', 'ESTUDIO_DUPLICADO');
      }
      throw err;
    }
  },

  async atualizarEstudio(id: number, dados: AtualizarEstudioDTO) {
    const atualizacao: Partial<typeof estudios.$inferInsert> = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome;

    const [atualizado] = await db
      .update(estudios)
      .set(atualizacao)
      .where(eq(estudios.id, id))
      .returning();

    return atualizado;
  },

  async deletarEstudio(id: string) {
    const [deletado] = await db
      .delete(estudios)
      .where(eq(estudios.id, Number(id)))
      .returning();
    return deletado;
  },
};
