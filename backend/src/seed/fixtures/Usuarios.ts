import bcrypt from 'bcryptjs';
import type { SeedContext } from '../config/context';
import { executeSeed, runDirect } from '../utils/executar';
import { SeedInputError } from '../utils/relatorio';
import { assertSeedDestination } from '../config/context';

export function assertFixtureEnvironment(env: NodeJS.ProcessEnv): string {
  if (env.APP_ENV !== 'test' || env.NODE_ENV !== 'test' || env.SEED_ALLOW_FIXTURES !== 'true') {
    throw new SeedInputError('Fixtures exigem APP_ENV=test, NODE_ENV=test e SEED_ALLOW_FIXTURES=true.');
  }
  assertSeedDestination(env);
  if (!env.DATABASE_URL) throw new SeedInputError('Fixtures exigem banco de testes explicito.');
  const host = new URL(env.DATABASE_URL).hostname;
  if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
    throw new SeedInputError('Fixtures limitadas a PostgreSQL local isolado.');
  }
  const password = env.SEED_FIXTURE_PASSWORD;
  if (!password || password.length < 12) {
    throw new SeedInputError('SEED_FIXTURE_PASSWORD deve conter pelo menos 12 caracteres.');
  }
  return password;
}

export function main(context?: SeedContext) {
  return executeSeed('FixturesUsuarios', async (ctx, report) => {
    const password = assertFixtureEnvironment(process.env);
    const users = [
      { nome: 'Demo User', email: 'demo@example.test' },
      { nome: 'Admin User', email: 'admin@example.test' },
    ];
    report.lidos = users.length;
    report.validos = users.length;
    const hash = await bcrypt.hash(password, 10);
    const counts = await ctx.prisma.$transaction(async db => {
      let inserted = 0;
      let unchanged = 0;
      for (const user of users) {
        const existing = await db.usuario.findUnique({ where: { email: user.email } });
        if (existing) {
          unchanged++;
          continue;
        }
        await db.usuario.create({
          data: {
            ...user, senha: hash,
            ...(user.email === 'admin@example.test' ? { admin: { create: { nivel: 'admin' } } } : {}),
          },
        });
        inserted++;
      }
      return { inserted, unchanged };
    }, { isolationLevel: 'Serializable' });
    report.inseridos = counts.inserted;
    report.inalterados = counts.unchanged;
  }, context);
}

runDirect(import.meta.url, main);
