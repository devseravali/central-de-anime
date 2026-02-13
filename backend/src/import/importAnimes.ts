import { db } from '../db';
import { animes } from '../schema/animes';
import type { InferInsertModel } from 'drizzle-orm';

export async function importAnimes() {
  const animeData = await import('../../data/entidades/animes.json');
  await db.delete(animes);
  await db.execute('ALTER SEQUENCE animes_id_seq RESTART WITH 1;');
  for (const anime of animeData.default.animes) {
    const animeInsert: InferInsertModel<typeof animes> = {
      anime_id: anime.anime_id,
      nome: anime.nome,
      titulo_portugues: anime.titulo_portugues,
      titulo_ingles: anime.titulo_ingles,
      titulo_japones: anime.titulo_japones,
      estudio_id: anime.estudio_id,
    };
    await db.insert(animes).values(animeInsert);
  }
  console.log('Importação de animes concluída!');
}
