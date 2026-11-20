import {
  assertSeedContext, createSeedContext, ValidationCleanupAfterCommitError, withValidatedImport, type SeedContext,
} from '../config/context';
import { isDirectExecution } from './caminhos';
import { newReport, safeError, SeedFailure, SeedInputError, type SeedReport } from './relatorio';
import { seedSources } from './fontes';

export type SeedMain = (context?: SeedContext) => Promise<SeedReport>;

export async function executeSeed(
  name: string,
  work: (context: SeedContext, report: SeedReport) => Promise<void>,
  shared?: SeedContext,
): Promise<SeedReport> {
  const report = newReport(name);
  let context: SeedContext | undefined = shared;
  let failed = false;
  try {
    if (shared) {
      assertSeedContext(shared);
      await work(shared, report);
    } else if (process.env.APP_ENV === 'validation') {
      if (!seedSources[name]) throw new SeedInputError(`Fontes nao autorizadas para o modulo ${name}.`);
      await withValidatedImport(async validated => {
        context = validated;
        await work(validated, report);
      });
    } else {
      context = createSeedContext();
      await work(context, report);
    }
  } catch (error) {
    failed = true;
    report.estado = 'falhou';
    report.erros.push(safeError(error));
    if (!shared && context?.kind === 'validation' && !(error instanceof ValidationCleanupAfterCommitError)) {
      report.inseridos = 0;
      report.atualizados = 0;
      report.avisos.push('Transacao sem confirmacao de commit; verificar o resultado antes de reexecutar.');
    }
  } finally {
    report.naoExecutados = report.lidos - report.inseridos - report.atualizados - report.inalterados;
    if (!shared && context?.kind === 'standard') {
      try {
        await context.prisma.$disconnect();
      } catch (error) {
        failed = true;
        report.estado = 'falhou';
        report.erros.push(safeError(error));
      }
    }
    (!shared && context?.kind === 'validation' ? console.log : context?.log ?? console.log)(JSON.stringify(report));
  }
  if (failed) throw new SeedFailure(report);
  return report;
}

export function runDirect(moduleUrl: string, main: SeedMain): void {
  if (!isDirectExecution(moduleUrl)) return;
  void main().catch(() => {
    // executeSeed already emits the sanitized failure report.
    process.exitCode = 1;
  });
}
