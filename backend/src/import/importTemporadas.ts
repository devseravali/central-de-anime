import { db } from '../db';
import type { InferInsertModel } from 'drizzle-orm';
import { temporadas } from '../schema/temporadas';
import temporadasData from '../../data/entidades/temporadas.json';
import 'dotenv/config';

export async function resetAndImportTemporadas() {
  console.log('Tabela temporadas apagada!');
  await db.delete(temporadas);
  await db.execute('ALTER SEQUENCE temporadas_id_seq RESTART WITH 1;');
  for (const temporada of temporadasData) {
    const temporadaInsert: InferInsertModel<typeof temporadas> = {
      anime_id: temporada.anime_id,
      slug: temporada.slug,
      nome: temporada.nome,
      tipo: temporada.tipo,
      temporada: temporada.temporada,
      status_id: temporada.status_id,
      ano: String(temporada.ano),
      estacao_id: temporada.estacao_id,
      episodios: temporada.episodios,
      sinopse: temporada.sinopse,
      capa_url: temporada.capaUrl ?? temporada.capaUrl,
    };
    await db.insert(temporadas).values(temporadaInsert);
    console.log(
      `Importado temporada: ${temporada.ano} - ${temporada.temporada}`,
    );
  }
  console.log('Importação de temporadas concluída!');
}

resetAndImportTemporadas();
