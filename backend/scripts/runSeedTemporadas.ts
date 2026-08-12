import path from 'node:path';
import { importTemporadasFromJson } from '../src/seed/Temporada';
import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data/entidades/temporada.json');
    console.log('Importando temporadas a partir de', dataPath);
    await importTemporadasFromJson(dataPath);
  } catch (err) {
    console.error('Erro ao executar seed de temporadas:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
