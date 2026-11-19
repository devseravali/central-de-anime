import { createSeedContext } from '../../src/seed/config/context';
import { synchronizeSequences } from '../../src/seed/utils/sequences';
import { safeError } from '../../src/seed/utils/relatorio';
let context: ReturnType<typeof createSeedContext> | undefined;
try {
  if (process.argv.slice(2).length || process.env.NODE_OPTIONS) throw new Error('Argumentos e NODE_OPTIONS nao permitidos.');
  if (process.env.SEED_SEQUENCE_CONFIRMATION !== 'CONFIRMO SINCRONIZAR SEQUENCES LOCAIS') {
    throw new Error('Confirmacao explicita de sequences obrigatoria.');
  }
  context = createSeedContext();
  await context.prisma.$transaction(synchronizeSequences, { timeout: 60000 });
  console.log(JSON.stringify({ result: 'concluida', operation: 'sequences' }));
} catch (error) {
  console.error(JSON.stringify({ result: 'bloqueada', message: safeError(error) }));
  process.exitCode = 1;
} finally {
  if (context) await context.prisma.$disconnect();
}
