import { createSeedContext, type SeedContext } from '../config/context';
import { isDirectExecution } from './caminhos';
import { newReport, safeError, SeedFailure, type SeedReport } from './relatorio';

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
    context ??= createSeedContext();
    await work(context, report);
  } catch (error) {
    failed = true;
    report.estado = 'falhou';
    report.erros.push(safeError(error));
  } finally {
    report.naoExecutados = report.lidos - report.inseridos - report.atualizados - report.inalterados;
    if (!shared && context) {
      try {
        await context.prisma.$disconnect();
      } catch (error) {
        failed = true;
        report.estado = 'falhou';
        report.erros.push(safeError(error));
      }
    }
    (context?.log ?? console.log)(JSON.stringify(report));
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
