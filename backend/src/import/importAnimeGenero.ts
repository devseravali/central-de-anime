import { db } from '../db';
import { anime_genero } from '../schema/anime_genero';
import animeGenerosData from '../../data/relacionamentos/anime_genero.json';

export async function importAnimeGenero() {
  await db.delete(anime_genero);
  await db.execute('ALTER SEQUENCE anime_genero_id_seq RESTART WITH 1;');

  for (const ag of animeGenerosData) {
    await db.insert(anime_genero).values({
      anime_id: ag.anime_id,
      genero_id: ag.genero_id,
    });
    console.log(
      `Importado relacionamento anime_genero: Anime ID ${ag.anime_id} - Gênero ID ${ag.genero_id}`,
    );
  }
  console.log('Importação de anime_genero concluída!');
}

importAnimeGenero();
