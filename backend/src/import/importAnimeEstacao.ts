import { db } from '../db';
import { anime_estacao } from '../schema/anime_estacao';
import animeEstacaoData from '../../data/relacionamentos/anime_estacao.json';

export async function importAnimeEstacao() {
  await db.delete(anime_estacao);
  await db.execute('ALTER SEQUENCE anime_estacao_id_seq RESTART WITH 1;');
  console.log('Tabela anime_estacao limpa.');

  for (const rel of animeEstacaoData) {
    await db.insert(anime_estacao).values({
      anime_id: Number(rel.anime_id),
      estacao_id: Number(rel.estacao),
    });
  }
  console.log('Importação de anime_estacao concluída!');
}
