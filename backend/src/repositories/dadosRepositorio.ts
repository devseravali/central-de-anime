import { generos } from '../schema/generos';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { estudios } from '../schema/estudios';
import { estacoes } from '../schema/estacoes';
import { animes } from '../schema/animes';
import { personagens } from '../schema/personagens';
import { db } from '../db';
import { isNotNull } from 'drizzle-orm/sql/expressions/conditions';
import { and } from 'drizzle-orm';

export interface BuscaPorNomeResultado {
  estacoes?: Array<{ id: number; nome: string }>;
  status?: Array<{ id: number; nome: string }>;
  estudios?: Array<{ id: number; nome: string }>;
  plataformas?: Array<{ id: number; nome: string }>;
  tags?: Array<{ id: number; nome: string }>;
  animes?: Array<{ id: number; titulo: string }>;
  personagens?: Array<{ id: number; nome: string }>;
}

function isNonNull<T>(value: T | null): value is T {
  return value !== null;
}

function mapIdNome<T extends { id: number; nome: string | null }>(rows: T[]) {
  return rows
    .map((r) => (isNonNull(r.nome) ? { id: r.id, nome: r.nome } : null))
    .filter(isNonNull);
}

function pickAnimeTitulo(a: { titulo: string | null }) {
  return a.titulo;
}

export const dadosRepositorio = {
  listarGeneros() {
    return db.select().from(generos);
  },

  listarPlataformas() {
    return db.select().from(plataformas);
  },

  listarStatus() {
    return db.select().from(status);
  },

  listarTags() {
    return db.select().from(tags);
  },

  listarEstudios() {
    return db.select().from(estudios);
  },

  listarEstacoes() {
    return db.select().from(estacoes);
  },

  listarAnimes() {
    return db.select().from(animes);
  },

  listarPersonagens() {
    return db.select().from(personagens);
  },

  buscarPorNomeRepositorio(
    entidade: string,
    nome: string,
  ): Promise<BuscaPorNomeResultado> {
    return buscarPorNomeServico(entidade, nome);
  },

  listarTemporadas(): Promise<Array<{ ano: number; temporada: number }>> {
    return db
      .select({ ano: animes.ano, temporada: animes.temporada })
      .from(animes)
      .where(and(isNotNull(animes.ano), isNotNull(animes.temporada)))
      .groupBy(animes.ano, animes.temporada)
      .then((rows) =>
        rows
          .filter(
            (row): row is { ano: number; temporada: number } =>
              row.ano !== null && row.temporada !== null,
          )
          .map((row) => ({ ano: row.ano, temporada: row.temporada })),
      );
  },
};
function buscarPorNomeServico(
  entidade: string,
  nome: string,
): Promise<BuscaPorNomeResultado> {
  throw new Error('Function not implemented.');
}
