import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const count = await prisma.usuario.count();
    console.log(`Usuários no banco: ${count}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro ao contar usuários:', msg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
