import { db } from '../db';
import { plataformas } from '../schema/plataformas';
import plataformasJson from '../../data/entidades/plataformas.json';

export async function importPlataformas() {
  await db.delete(plataformas);
  await db.execute('ALTER SEQUENCE plataformas_id_seq RESTART WITH 1;');
  for (const plataforma of plataformasJson) {
    await db.insert(plataformas).values({
      nome: plataforma.nome,
    });
  }

  console.log('Importação de plataformas concluída!');
}

importPlataformas();
