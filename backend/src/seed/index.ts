import { createSeedContext, type SeedContext } from './config/context';
import { modules } from './config/modulos';
import { isDirectExecution } from './utils/caminhos';
import { safeError, SeedFailure, type SeedReport } from './utils/relatorio';
import { validateInputs } from './validacoes/Entrada';

export async function main(shared?: SeedContext): Promise<SeedReport[]> {
  const reports: SeedReport[] = [];
  let context = shared;
  let failure: unknown;
  try {
    reports.push(await validateInputs());
    context ??= createSeedContext();
    for (const seed of modules) reports.push(await seed(context));
  } catch (error) {
    failure = error;
    if (error instanceof SeedFailure) reports.push(error.report);
  } finally {
    if (!shared && context) {
      try {
        await context.prisma.$disconnect();
      } catch (error) {
        failure ??= error;
      }
    }
    (context?.log ?? console.log)(JSON.stringify({
      estado: failure ? 'falhou' : 'concluido',
      modulos: reports,
      erro: failure ? safeError(failure) : null,
      observacao: 'Lotes confirmados permanecem persistidos em caso de falha posterior. Sequences nao sao alteradas.',
    }));
  }
  if (failure) throw failure;
  return reports;
}

if (isDirectExecution(import.meta.url)) {
  void main().catch(() => { process.exitCode = 1; });
}
