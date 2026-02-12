import { db } from '../db';
import { personagens } from '../schema/personagens';
import { animes } from '../schema/animes';
import { anime_personagem } from '../schema/anime_personagem';
import { eq, sql } from 'drizzle-orm';

import type {
  Personagem,
  CriarPersonagemDTO,
  AtualizarPersonagemDTO,
} from '../types/personagem';

import { normalizarTextoComparacao } from '../helpers/textHelpers';

function matchNomePersonagemSQL(nome: string) {
  const normalizado = normalizarTextoComparacao(nome);
  return sql`replace(lower(${personagens.nome}), ' ', '') = ${normalizado}`;
}

function toPersonagem(row: typeof personagens.$inferSelect): Personagem {
  return {
    id: Number(row.id),
    nome: String(row.nome ?? ''),
    idade_inicial: row.idade_inicial ? Number(row.idade_inicial) : 0,
    sexo: String(row.sexo ?? ''),
    papel: String(row.papel ?? ''),
    imagem: String(row.imagem ?? ''),
    aniversario: String(row.aniversario ?? ''),
    altura_inicial: String(row.altura_inicial ?? ''),
    afiliacao: String(row.afiliacao ?? ''),
    sobre: String(row.sobre ?? ''),
  };
}

function toInsertPayload(dados: CriarPersonagemDTO) {
  return {
    nome: normalizarTextoComparacao(String(dados.nome ?? '')),
    idade_inicial: String(dados.idade_inicial ?? ''),
    sexo: String(dados.sexo ?? ''),
    papel: String(dados.papel ?? ''),
    imagem: String(dados.imagem ?? ''),
    aniversario: String(dados.aniversario ?? ''),
    altura_inicial: String(dados.altura_inicial ?? ''),
    afiliacao: String(dados.afiliacao ?? ''),
    sobre: String(dados.sobre ?? ''),
  };
}

function toUpdatePayload(dados: AtualizarPersonagemDTO) {
  return {
    ...(dados.nome !== undefined
      ? { nome: normalizarTextoComparacao(String(dados.nome)) }
      : {}),
    ...(dados.idade_inicial !== undefined
      ? { idade_inicial: String(dados.idade_inicial) }
      : {}),
    ...(dados.sexo !== undefined ? { sexo: String(dados.sexo) } : {}),
    ...(dados.papel !== undefined ? { papel: String(dados.papel) } : {}),
    ...(dados.imagem !== undefined ? { imagem: String(dados.imagem) } : {}),
    ...(dados.aniversario !== undefined
      ? { aniversario: String(dados.aniversario) }
      : {}),
    ...(dados.altura_inicial !== undefined
      ? { altura_inicial: String(dados.altura_inicial) }
      : {}),
    ...(dados.afiliacao !== undefined
      ? { afiliacao: String(dados.afiliacao) }
      : {}),
    ...(dados.sobre !== undefined ? { sobre: String(dados.sobre) } : {}),
  };
}

export const personagemRepositorio = {
  async listar(): Promise<Personagem[]> {
    const rows = await db.select().from(personagens);
    return rows.map(toPersonagem);
  },

  async porId(id: number): Promise<Personagem | undefined> {
    const [row] = await db
      .select()
      .from(personagens)
      .where(eq(personagens.id, id))
      .limit(1);

    return row ? toPersonagem(row) : undefined;
  },

  async porNome(nome: string): Promise<Personagem | undefined> {
    const [row] = await db
      .select()
      .from(personagens)
      .where(matchNomePersonagemSQL(nome))
      .limit(1);

    return row ? toPersonagem(row) : undefined;
  },

  listarAnimesPorPersonagemId(personagemId: number) {
    return db
      .select()
      .from(animes)
      .innerJoin(anime_personagem, eq(animes.id, anime_personagem.anime_id))
      .where(eq(anime_personagem.personagem_id, personagemId));
  },

  async criar(dados: CriarPersonagemDTO): Promise<Personagem> {
    const [row] = await db
      .insert(personagens)
      .values(toInsertPayload(dados))
      .returning();

    return toPersonagem(row);
  },

  async atualizar(
    id: number,
    dados: AtualizarPersonagemDTO,
  ): Promise<Personagem | undefined> {
    const [row] = await db
      .update(personagens)
      .set(toUpdatePayload(dados))
      .where(eq(personagens.id, id))
      .returning();

    return row ? toPersonagem(row) : undefined;
  },

  async deletar(id: number): Promise<Personagem | undefined> {
    const [row] = await db
      .delete(personagens)
      .where(eq(personagens.id, id))
      .returning();

    return row ? toPersonagem(row) : undefined;
  },
};
