import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const rows = await prisma.temporada.findMany({ select: { id: true, nome: true } });
    console.log('Temporadas existentes:', rows);
  } catch (err) {
    console.error('Erro listando temporadas:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
