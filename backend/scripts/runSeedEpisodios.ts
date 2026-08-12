import path from 'node:path';
import { importEpisodiosFromJson } from '../src/seed/Episodios';
import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data/entidades/episodios.json');
    console.log('Importando episódios a partir de', dataPath);
    await importEpisodiosFromJson(dataPath);
  } catch (err) {
    console.error('Erro ao executar seed de episódios:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
