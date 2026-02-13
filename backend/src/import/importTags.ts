import { db } from '../db';
import { tags } from '../schema/tags';
import tagssData from '../../data/entidades/tags.json';

export async function importTags() {
  await db.delete(tags);
  await db.execute('ALTER SEQUENCE tags_id_seq RESTART WITH 1;');
  for (const tagsItem of tagssData) {
    await db.insert(tags).values({
      id: tagsItem.id,
      nome: tagsItem.nome,
    });
    console.log(`Importado tags: ${tagsItem.nome}`);
  }
}

importTags();
