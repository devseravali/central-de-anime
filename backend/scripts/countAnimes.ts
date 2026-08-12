import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const count = await prisma.anime.count();
    console.log(`Animes no banco: ${count}`);
  } catch (err) {
    console.error('Erro ao contar animes:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
