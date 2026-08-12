import { prisma } from '../src/config/prisma';

async function main() {
  try {
    console.log('Iniciando remoção de relacionamentos de personagem (AnimePersonagem)...');
    const relResult = await prisma.animePersonagem.deleteMany({});
    console.log(`Relacionamentos apagados: ${relResult.count}`);

    console.log('Removendo personagens...');
    const result = await prisma.personagem.deleteMany({});
    console.log(`Remoção concluída. Registros apagados: ${result.count}`);
  } catch (err) {
    console.error('Erro ao apagar personagens:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Script falhou:', e);
  process.exit(1);
});
