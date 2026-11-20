import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../../../generated/prisma/client';
import {
  assertAdministrativeWrite, loadEnvironment, selectEnvironment, validateDatabaseUrls,
} from '../../config/environment';
import { authorizeProductionAdmin, seedOperation } from '../../config/productionAdmin';
import {
  loadValidationEnvironment, validationDatabases, validationHost, validationPort, validationRole,
} from '../../config/validationEnvironment.mjs';
import { SeedInputError } from '../utils/relatorio';
import { allSeedSources, captureSources, type SourceSnapshot } from '../utils/fontes';

export type SeedDatabase = Prisma.TransactionClient;
type StandardSeedContext = {
  kind: 'standard';
  prisma: PrismaClient;
  log: (message: string) => void;
  insertOnly?: boolean;
};
type ValidationSeedContext = {
  kind: 'validation';
  prisma: SeedDatabase;
  log: (message: string) => void;
  insertOnly: true;
  source: SourceSnapshot;
};
export type SeedContext = StandardSeedContext | ValidationSeedContext;

const activeValidationContexts = new WeakMap<ValidationSeedContext, string>();

export class ValidationCleanupAfterCommitError extends SeedInputError {
  constructor(message = 'Importacao confirmada, mas falhou o encerramento do cliente Prisma.') {
    super(message);
  }
}

export function assertSeedContext(context: SeedContext): void {
  if (process.env.APP_ENV !== 'validation' && context.kind !== 'validation') return;
  if (context.kind !== 'validation') throw new SeedInputError('Contexto de importacao nao validado.');
  const expected = activeValidationContexts.get(context);
  if (!expected || loadValidationEnvironment('import', process.env).connectionUrl !== expected) {
    throw new SeedInputError('Contexto de importacao expirado ou destino divergente.');
  }
}

export async function inSeedTransaction<T>(
  context: SeedContext,
  work: (db: SeedDatabase) => Promise<T>,
  options?: { isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number },
): Promise<T> {
  assertSeedContext(context);
  if (context.kind === 'validation') return work(context.prisma);
  return context.prisma.$transaction(work, options);
}

export async function withValidatedImport<T>(
  work: (context: SeedContext) => Promise<T>,
): Promise<T> {
  const { connectionUrl } = loadValidationEnvironment('import', process.env);
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionUrl }), log: [] });
  const messages: string[] = [];
  let committed = false;
  try {
    const result = await client.$transaction(async tx => {
      const rows = await tx.$queryRaw<{
        database: string | null; role: string | null; host: string | null; port: number | null;
      }[]>`SELECT current_database() AS "database", current_user AS "role",
        host(inet_server_addr()) AS "host", inet_server_port() AS "port"`;
      const identity = rows.length === 1 ? rows[0] : undefined;
      if (!identity || identity.database !== validationDatabases.import ||
          identity.role !== validationRole || identity.host !== validationHost ||
          identity.port !== Number(validationPort)) {
        throw new SeedInputError('Identidade da sessao de importacao divergente ou ausente.');
      }
      const source = await captureSources(allSeedSources);
      const context: ValidationSeedContext = Object.freeze({
        kind: 'validation', prisma: tx, insertOnly: true, source, log: message => messages.push(message),
      });
      activeValidationContexts.set(context, connectionUrl);
      try {
        assertSeedContext(context);
        return await work(context);
      } finally {
        activeValidationContexts.delete(context);
      }
    }, { isolationLevel: 'Serializable', timeout: 600000 });
    committed = true;
    try {
      for (const message of messages) console.log(message);
    } catch {
      throw new ValidationCleanupAfterCommitError('Importacao confirmada, mas falhou a emissao dos relatorios.');
    }
    return result;
  } finally {
    try {
      await client.$disconnect();
    } catch {
      if (committed) throw new ValidationCleanupAfterCommitError();
      console.error('Falha ao encerrar cliente Prisma apos erro na importacao.');
    }
  }
}

export function assertSeedDestination(env: NodeJS.ProcessEnv): string {
  if (env.APP_ENV === 'validation') return loadValidationEnvironment('import', env).connectionUrl;
  const environment = selectEnvironment(env.APP_ENV);
  assertAdministrativeWrite(environment);
  return validateDatabaseUrls(environment, env).application.toString();
}

// Contexto exclusivo dos runners de producao: exige autorizacao ja validada
// (a de seed individual) e nunca atualiza registros existentes.
export function createAuthorizedProductionSeedContext(seed: string): SeedContext {
  authorizeProductionAdmin(seedOperation(seed), process.env);
  if (selectEnvironment(process.env.APP_ENV) !== 'production') {
    throw new Error('Contexto de seed autorizado so existe em producao.');
  }
  throw new Error('Importacao de producao bloqueada: identidade da sessao efetiva de escrita e schema migrado ainda nao comprovados.');
}

export function createSeedContext(): StandardSeedContext {
  if (process.env.APP_ENV === 'validation') {
    throw new SeedInputError('Validation exige transacao de importacao com identidade comprovada.');
  }
  assertAdministrativeWrite(selectEnvironment(process.env.APP_ENV));
  loadEnvironment();
  const adapter = new PrismaPg({ connectionString: assertSeedDestination(process.env) });
  return {
    kind: 'standard',
    prisma: new PrismaClient({ adapter, log: [] }),
    log: (message) => console.log(message),
    insertOnly: true,
  };
}
