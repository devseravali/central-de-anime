import { db } from '../db';
import { anime_estudio } from '../schema/anime_estudio';
import animeEstudioData from '../../data/relacionamentos/anime_estudio.json';

export async function importAnimeEstudio() {
  await db.delete(anime_estudio);
  await db.execute('ALTER SEQUENCE anime_estudio_id_seq RESTART WITH 1;');
  for (const relacionamento of animeEstudioData) {
    await db.insert(anime_estudio).values(relacionamento);
  }
  console.log('Importação de anime_estudio concluída!');
}

importAnimeEstudio();
