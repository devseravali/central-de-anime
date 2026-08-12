import { prisma } from '../src/config/prisma';

async function main() {
  try {
    console.log('Apagando WatchProgress relacionados a episódios...');
    await prisma.watchProgress.deleteMany({});

    console.log('Apagando episódios...');
    const result = await prisma.episodio.deleteMany({});
    console.log(`Episódios apagados: ${result.count}`);
  } catch (err) {
    console.error('Erro ao apagar episódios:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Script falhou:', e);
  process.exit(1);
});
