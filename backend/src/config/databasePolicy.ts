import { EnvironmentError } from './environment';

const readOperations = new Set([
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow',
  'findMany', 'count', 'aggregate', 'groupBy',
]);

export function assertDatabaseOperation(readOnly: boolean, operation: string): void {
  if (readOnly && !readOperations.has(operation)) {
    throw new EnvironmentError('Operacao bloqueada: ambiente somente leitura. SQL bruto tambem esta bloqueado.');
  }
}
