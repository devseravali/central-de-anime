import { db } from '../db';
import { anime_plataforma } from '../schema/anime_plataforma';
import animePlataformaData from '../../data/relacionamentos/anime_plataforma.json';

export async function importAnimePlataforma() {
  await db.delete(anime_plataforma);
  await db.execute('ALTER SEQUENCE anime_plataforma_id_seq RESTART WITH 1;');

  for (const ap of animePlataformaData) {
    await db.insert(anime_plataforma).values({
      anime_id: ap.anime_id,
      plataforma_id: ap.plataforma_id,
    });
    console.log(
      `Importado relacionamento anime_plataforma: Anime ID ${ap.anime_id} - Plataforma ID ${ap.plataforma_id}`,
    );
  }
  console.log('Importação de anime_plataforma concluída!');
}

importAnimePlataforma();
