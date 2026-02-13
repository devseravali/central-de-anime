import { db } from '../db';
import { estudios } from '../schema/estudios';
import estudiosData from '../../data/entidades/estudios.json';

export async function importEstudios() {
  await db.delete(estudios);
  await db.execute('ALTER SEQUENCE estudios_id_seq RESTART WITH 1;');
  let count = 0;
  for (const estudio of estudiosData) {
    const principaisObras = Array.isArray(estudio.principais_obras)
      ? estudio.principais_obras.join(', ')
      : estudio.principais_obras;
    await db.insert(estudios).values({
      id: estudio.id,
      nome: estudio.nome,
      principaisObras,
    });
    count++;
  }
  console.log(`Importação de estudios concluída! Total inseridos: ${count}`);
}
