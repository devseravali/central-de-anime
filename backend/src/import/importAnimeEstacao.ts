import { db } from '../db';
import { anime_estacao } from '../schema/anime_estacao';
import animeGenerosData from '../../data/relacionamentos/anime_estacao.json';

export async function importAnimeEstacao() {
  await db.delete(anime_estacao);
  await db.execute('ALTER SEQUENCE anime_estacao_id_seq RESTART WITH 1;');
  console.log('Tabela anime_estacao limpa.');
  for (const ag of animeGenerosData) {
    await db.insert(anime_estacao).values({
      anime_id: ag.anime_id,
      temporada: ag.temporada,
      estacao_id: ag.estacao_id,
    });
    console.log(
      `Importado relacionamento anime_estacao: Anime ID ${ag.anime_id} - Estação ID ${ag.estacao_id}`,
    );
  }
  console.log('Importação de anime_estacao concluída!');
}

importAnimeEstacao();
