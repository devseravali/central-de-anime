import { db } from '../db';
import { anime_status } from '../schema/anime_status';
import animeStatusData from '../../data/relacionamentos/anime_status.json';

export async function importAnimeStatus() {
  await db.delete(anime_status);
  await db.execute('ALTER SEQUENCE anime_status_id_seq RESTART WITH 1;');

  for (const status of animeStatusData) {
    await db.insert(anime_status).values({
      anime_id: status.anime_id,
      status_id: status.status_id,
    });
    console.log(
      `Importado relacionamento anime_status: Anime ID ${status.anime_id} - Status ID ${status.status_id}`,
    );
  }
  console.log('Importação de anime_status concluída!');
}

importAnimeStatus();
