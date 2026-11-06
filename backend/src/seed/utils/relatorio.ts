export type SeedReport = {
  modulo: string;
  lidos: number;
  validos: number;
  inseridos: number;
  atualizados: number;
  inalterados: number;
  naoExecutados: number;
  avisos: string[];
  erros: string[];
  estado: 'concluido' | 'falhou';
};

export function newReport(modulo: string): SeedReport {
  return {
    modulo, lidos: 0, validos: 0, inseridos: 0, atualizados: 0,
    inalterados: 0, naoExecutados: 0, avisos: [], erros: [], estado: 'concluido',
  };
}

export class SeedFailure extends Error {
  constructor(public readonly report: SeedReport) {
    super(`Seed ${report.modulo} falhou.`);
  }
}

export function safeError(error: unknown): string {
  if (error instanceof SeedFailure) return error.message;
  if (error instanceof Error && error.name === 'SeedInputError') return error.message;
  if (typeof error === 'object' && error !== null && 'code' in error &&
      typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code)) {
    return `Falha de infraestrutura/persistencia (${error.code}).`;
  }
  return 'Falha de infraestrutura/persistencia; detalhes internos omitidos.';
}

export class SeedInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeedInputError';
  }
}
