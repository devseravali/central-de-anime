import { db } from '../db';
import { animes } from '../schema/animes';
import type { AnimeJSON } from '../types/anime';
import { sql } from 'drizzle-orm';
import animeData from '../../data/entidades/anime.json';

export async function importAnimes() {

  await db.execute(sql`TRUNCATE TABLE animes RESTART IDENTITY CASCADE;`);

  const estacoes = [
    { id: 1, nome: 'Primavera' },
    { id: 2, nome: 'Verão' },
    { id: 3, nome: 'Outono' },
    { id: 4, nome: 'Inverno' },
  ];

  function getEstacaoId(nome: string | null | undefined): number | null {
    if (!nome) return null;
    const estacao = estacoes.find(
      (e) => e.nome.toLowerCase() === String(nome).toLowerCase(),
    );
    return estacao ? estacao.id : null;
  }
  let inseridos = 0;
  for (const anime of animeData) {
    if (typeof anime.estudio_id !== 'number') {
      throw new Error(
        `estudio_id ausente ou inválido para o anime: ${anime.slug ?? anime.id}`,
      );
    }

    await db.insert(animes).values({
      anime_id: anime.anime_id!,
      slug: anime.slug!,
      titulo: anime.titulo!,
      estudio_id: anime.estudio_id!,
      tipo:
        typeof anime.tipo === 'string' && anime.tipo ? anime.tipo : 'Temporada',
      temporada: anime.temporada!,
      status_id: anime.status_id!,
      ano: anime.ano!,
      estacao_id: getEstacaoId(anime.estacao),
      episodios: anime.episodios!,
      sinopse: anime.sinopse!,
      ...(typeof anime.capaUrl === 'string' ? { capaUrl: anime.capaUrl } : {}),
    });
    inseridos++;
    if (inseridos <= 3) {
      console.log(`[DEBUG] Inserido:`, anime.slug, anime.titulo);
    }
  }

  const total = await db.select().from(animes);
  console.log(`Total de animes no banco: ${total.length}`);
  if (total.length > 0) {
    console.log('Primeiros animes:', total.slice(0, 3));
  }
  console.log('Importação de animes concluída!');
}

importAnimes();
