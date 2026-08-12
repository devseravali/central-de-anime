import path from 'node:path';
import { importPersonagensFromJson } from '../src/seed/Personagens';
import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data/entidades/personagens.json');
    console.log('Importando personagens a partir de', dataPath);
    await importPersonagensFromJson(dataPath);
  } catch (err) {
    console.error('Erro ao executar seed de personagens:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
