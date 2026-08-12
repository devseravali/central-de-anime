import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const count = await prisma.personagem.count();
    console.log(`Personagens no banco: ${count}`);
  } catch (err) {
    console.error('Erro ao contar personagens:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
