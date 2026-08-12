import { prisma } from '../src/config/prisma';

async function main() {
  try {
    console.log('Apagando temporadas...');
    const result = await prisma.temporada.deleteMany({});
    console.log(`Temporadas apagadas: ${result.count}`);
  } catch (err) {
    console.error('Erro ao apagar temporadas:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Script falhou:', e);
  process.exit(1);
});
