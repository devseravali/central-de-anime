import {
  assertSeedContext, createSeedContext, ValidationCleanupAfterCommitError, withValidatedImport, type SeedContext,
} from './config/context';
import { modules } from './config/modulos';
import { isDirectExecution } from './utils/caminhos';
import { safeError, SeedFailure, type SeedReport } from './utils/relatorio';
import { validateInputs } from './validacoes/Entrada';

export async function main(shared?: SeedContext): Promise<SeedReport[]> {
  const reports: SeedReport[] = [];
  let context = shared;
  let failure: unknown;
  try {
    if (shared) {
      assertSeedContext(shared);
      reports.push(await validateInputs(shared));
      for (const seed of modules) reports.push(await seed(shared));
    } else if (process.env.APP_ENV === 'validation') {
      await withValidatedImport(async validated => {
        context = validated;
        reports.push(await validateInputs(validated));
        for (const seed of modules) reports.push(await seed(validated));
      });
    } else {
      reports.push(await validateInputs());
      context = createSeedContext();
      for (const seed of modules) reports.push(await seed(context));
    }
  } catch (error) {
    failure = error;
    if (error instanceof SeedFailure) reports.push(error.report);
  } finally {
    if (!shared && context?.kind === 'standard') {
      try {
        await context.prisma.$disconnect();
      } catch (error) {
        failure ??= error;
      }
    }
    if (failure && !(failure instanceof ValidationCleanupAfterCommitError) && context?.kind === 'validation') {
      for (const report of reports.slice(1)) {
        report.estado = 'falhou';
        report.inseridos = 0;
        report.atualizados = 0;
        report.naoExecutados = report.lidos - report.inalterados;
        report.avisos.push('Transacao sem confirmacao de commit; verificar o resultado antes de reexecutar.');
      }
    }
    (!shared && context?.kind === 'validation' ? console.log : context?.log ?? console.log)(JSON.stringify({
      estado: failure ? 'falhou' : 'concluido',
      modulos: reports,
      erro: failure ? safeError(failure) : null,
      observacao: process.env.APP_ENV === 'validation' || context?.kind === 'validation'
        ? 'Importacao de validacao executada em uma unica transacao.'
        : 'Lotes confirmados permanecem persistidos em caso de falha posterior. Execute seed:sequences separadamente apos verificar a importacao.',
    }));
  }
  if (failure) throw failure;
  return reports;
}

if (isDirectExecution(import.meta.url)) {
  void main().catch(() => { process.exitCode = 1; });
}
