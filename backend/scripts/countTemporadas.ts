import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const count = await prisma.temporada.count();
    console.log('Temporadas no banco:', count);
  } catch (err) {
    console.error('Erro ao contar temporadas:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
