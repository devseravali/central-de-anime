import { db } from '../db';
import { Animes } from '../schema/animes';
import type { AnimeJSON } from '../types/anime';
import { sql } from 'drizzle-orm';
import animeData from '../../data/entidades/anime.json';

export async function importAnimes() {
  let inseridos = 0;
  for (const anime of animeData) {
    if (typeof anime.estudio_id !== 'number') {
      throw new Error(
        `estudio_id ausente ou inválido para o anime: ${anime.slug ?? anime.id}`,
      );
    }

    await db.insert(Animes).values({
      anime_id: anime.anime_id,
      slug: anime.slug,
      titulo: anime.titulo,
      estudio_id: anime.estudio_id,
      tipo: anime.tipo,
      temporada: anime.temporada,
      status_id: anime.status_id,
      ano: anime.ano,
      estacao_id: anime.estacao_id,
      episodios: anime.episodios,
      sinopse: anime.sinopse,
      capaUrl: anime.capaUrl,
    });
    inseridos++;
    if (inseridos <= 3) {
      console.log(`[DEBUG] Inserido:`, anime.slug, anime.titulo);
    }
  }

  // Consulta para depuração
  const total = await db.select().from(Animes);
  console.log(`Total de animes no banco: ${total.length}`);
  if (total.length > 0) {
    console.log('Primeiros animes:', total.slice(0, 3));
  }
  console.log('Importação de animes concluída!');
}
