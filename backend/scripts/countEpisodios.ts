import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const count = await prisma.episodio.count();
    console.log(`Episódios no banco: ${count}`);
  } catch (err) {
    console.error('Erro ao contar episódios:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
