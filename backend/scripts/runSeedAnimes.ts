import path from 'node:path';
import { importAnimeFromJson } from '../src/seed/Animes';
import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data/entidades/animes.json');
    console.log('Importando animes a partir de', dataPath);
    await importAnimeFromJson(dataPath);
  } catch (err) {
    console.error('Erro ao executar seed de animes:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
