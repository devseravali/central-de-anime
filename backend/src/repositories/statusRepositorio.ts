import { db } from '../db';
import { status } from '../schema/status';
import { anime_status } from '../schema/anime_status';
import { eq } from 'drizzle-orm';
import { ErroApi } from '../errors/ErroApi';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type {
  Status,
  CriarStatusDTO,
  AtualizarStatusDTO,
} from '../types/status';

import type { Status as StatusType } from '../types/status';
function mapStatus(row: { id: number; nome: string }): StatusType {
  return {
    id: row.id,
    nome: row.nome,
  };
}

export const statusRepositorio = {
  async listar(): Promise<Status[]> {
    const rows = await db.select().from(status);
    return rows.map((row) => ({
      ...mapStatus(row),
      nome: normalizarTextoComparacao(row.nome),
    }));
  },

  async porId(id: number): Promise<Status | null> {
    const [row] = await db
      .select()
      .from(status)
      .where(eq(status.id, id))
      .limit(1);

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },

  async porNome(nome: string): Promise<Status | null> {
    const nomeNormalizado = normalizarTextoComparacao(nome);
    const rows = await db.select().from(status);

    const encontrado = rows.find((s) => {
      const nomeDb = typeof s.nome === 'string' ? s.nome : String(s.nome ?? '');
      return normalizarTextoComparacao(nomeDb) === nomeNormalizado;
    });

    return encontrado
      ? {
          ...mapStatus(encontrado),
          nome: normalizarTextoComparacao(encontrado.nome),
        }
      : null;
  },

  async criar(dados: CriarStatusDTO): Promise<Status> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    const existente = await this.porNome(nomeNormalizado);
    if (existente) {
      throw ErroApi.conflict('Status já existe', 'STATUS_ALREADY_EXISTS');
    }

    const [row] = await db
      .insert(status)
      .values({ nome: nomeNormalizado })
      .returning();

    return { ...mapStatus(row), nome: nomeNormalizado };
  },

  async atualizar(
    id: number,
    dados: AtualizarStatusDTO,
  ): Promise<Status | null> {
    const atual = await this.porId(id);
    if (!atual) return null;

    let nomeNormalizado: string | undefined = undefined;
    if (dados.nome !== undefined) {
      nomeNormalizado = normalizarTextoComparacao(dados.nome);
      const existente = await this.porNome(nomeNormalizado);
      if (existente && existente.id !== id) {
        throw ErroApi.conflict(
          'Nome de status já existe',
          'STATUS_NAME_ALREADY_EXISTS',
        );
      }
    }

    const [row] = await db
      .update(status)
      .set({
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
      })
      .where(eq(status.id, id))
      .returning();

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },

  async deletar(id: number): Promise<Status | null> {
    const existente = await this.porId(id);
    if (!existente) return null;

    await db.delete(anime_status).where(eq(anime_status.status_id, id));

    const [row] = await db.delete(status).where(eq(status.id, id)).returning();

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },
};
