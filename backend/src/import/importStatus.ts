import { db } from '../db';
import { status } from '../schema/status';
import statusData from '../../data/entidades/status.json';
import { eq } from 'drizzle-orm';

async function importStatus() {
  await db.delete(status);
  await db.execute('ALTER SEQUENCE status_id_seq RESTART WITH 1;');
  let novos = 0;
  let atualizados = 0;
  for (const statusItem of statusData) {
    const existente = await db
      .select()
      .from(status)
      .where(eq(status.id, statusItem.id));
    if (!existente || existente.length === 0) {
      await db.insert(status).values({
        id: statusItem.id,
        nome: statusItem.nome,
      });
      novos++;
      console.log(`Importado status: ${statusItem.nome}`);
    } else {
      if (existente[0].nome !== statusItem.nome) {
        await db
          .update(status)
          .set({ nome: statusItem.nome })
          .where(eq(status.id, statusItem.id));
        atualizados++;
        console.log(`Atualizado status: ${statusItem.nome}`);
      } else {
        console.log(`Já existe status: ${statusItem.nome}`);
      }
    }
  }
  console.log(
    `Novos: ${novos}, atualizados: ${atualizados}, total no arquivo: ${statusData.length}`,
  );
}

importStatus();
