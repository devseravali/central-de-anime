import { db } from '../db';
import { generos } from '../schema/generos';
import GenerosData from '../../data/entidades/generos.json';

async function importGeneros() {
  await db.delete(generos);
  await db.execute('ALTER SEQUENCE generos_id_seq RESTART WITH 1;');
  for (const genero of GenerosData) {
    try {
      await db.insert(generos).values({
        id: genero.id,
        nome: genero.nome,
      });
    } catch (error) {
      console.error(
        `Erro ao importar gênero: ${genero.nome || JSON.stringify(genero)}`,
      );
      console.error(error);
    }
  }
  console.log('Importação de gêneros concluída!');
}

importGeneros();
