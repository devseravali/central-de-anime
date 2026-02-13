import { db } from '../db';
import { estacoes } from '../schema/estacoes';
import estacoesData from '../../data/entidades/estacoes.json';

async function importEstacoes() {
  await db.delete(estacoes);
  await db.execute('ALTER SEQUENCE estacoes_id_seq RESTART WITH 1;');
  for (const estacao of estacoesData) {
    await db.insert(estacoes).values(estacao);
  }
  console.log('Importação concluída!');
}

importEstacoes();
