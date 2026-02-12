import { generos } from '../schema/generos';
import { plataformas } from '../schema/plataformas';
import { status } from '../schema/status';
import { tags } from '../schema/tags';
import { temporadas } from '../schema/temporadas';
import { estudios } from '../schema/estudios';
import { estacoes } from '../schema/estacoes';
import { animes } from '../schema/animes';
import { personagens } from '../schema/personagens';
import { relacoesRepositorio } from './relacoesRepositorio';
import { db } from '../db';

export interface BuscaPorNomeResultado {
  temporadas?: Array<{ id: number; nome: string }>;
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

function pickAnimeTitulo(a: {
  titulo_portugues: string | null;
  titulo_ingles: string | null;
  titulo_japones: string | null;
}) {
  return a.titulo_portugues ?? a.titulo_ingles ?? a.titulo_japones;
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

  listarTemporadas() {
    return db.select().from(temporadas);
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

  buscarPorNome(
    entidade: string,
    nome: string,
  ): Promise<BuscaPorNomeResultado> {
    return buscarPorNome(entidade, nome);
  },
};

export async function buscarPorNome(
  entidade: string,
  nome: string,
): Promise<BuscaPorNomeResultado> {
  switch (entidade) {
    case 'temporadas': {
      const rows = await relacoesRepositorio.buscarTemporadasPorNome(nome);
      return { temporadas: mapIdNome(rows) };
    }

    case 'estacoes': {
      const rows = await relacoesRepositorio.buscarEstacoesPorNome(nome);
      return { estacoes: mapIdNome(rows) };
    }

    case 'status': {
      const rows = await relacoesRepositorio.buscarStatusPorNome(nome);
      return { status: mapIdNome(rows) };
    }

    case 'estudios': {
      const rows = await relacoesRepositorio.buscarEstudiosPorNome(nome);
      return { estudios: mapIdNome(rows) };
    }

    case 'plataformas': {
      const rows = await relacoesRepositorio.buscarPlataformasPorNome(nome);
      return { plataformas: mapIdNome(rows) };
    }

    case 'tags': {
      const rows = await relacoesRepositorio.buscarTagsPorNome(nome);
      return { tags: mapIdNome(rows) };
    }

    case 'personagens': {
      const rows = await relacoesRepositorio.buscarPersonagensPorNome(nome);
      return { personagens: mapIdNome(rows) };
    }

    case 'animes': {
      const rows = await relacoesRepositorio.buscarAnimesPorTitulo(nome);

      const animesResult = rows
        .map((a) => {
          const titulo = pickAnimeTitulo(a);
          return titulo ? { id: a.id, titulo } : null;
        })
        .filter(isNonNull);

      return { animes: animesResult };
    }

    default:
      return {};
  }
}