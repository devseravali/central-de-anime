import { createAuthorizedProductionSeedContext } from '../src/seed/config/context';
import {
  authorizeProductionAdmin, PRODUCTION_SEEDS, seedOperation, type ProductionSeed,
} from '../src/config/productionAdmin';
import {
  assertCleanInvocation, consumeAuthorizationNonce, openReadOnlyClient, readUsedNonces, safeMessage, writeAudit,
} from './prod-admin-common';

const MODULES: Record<ProductionSeed, () => Promise<{ main: (context?: any) => Promise<unknown> }>> = {
  status: () => import('../src/seed/auxiliares/Status'),
  generos: () => import('../src/seed/auxiliares/Generos'),
  estudios: () => import('../src/seed/auxiliares/Estudios'),
  plataformas: () => import('../src/seed/auxiliares/Plataformas'),
  tags: () => import('../src/seed/auxiliares/Tags'),
  franquias: () => import('../src/seed/auxiliares/Franquias'),
  capas: () => import('../src/seed/auxiliares/Capas'),
  estacoes: () => import('../src/seed/auxiliares/Estacoes'),
  animes: () => import('../src/seed/entidades/Animes'),
  personagens: () => import('../src/seed/entidades/Personagens'),
  episodios: () => import('../src/seed/entidades/Episodios'),
  'anime-genero': () => import('../src/seed/relacionamentos/AnimeGenero'),
  'anime-personagem': () => import('../src/seed/relacionamentos/AnimePersonagem'),
  'anime-plataforma': () => import('../src/seed/relacionamentos/AnimePlataforma'),
  'anime-tag': () => import('../src/seed/relacionamentos/AnimeTag'),
};

try {
  assertCleanInvocation(1);
  const name = process.argv[2] ?? '';
  if (!Object.hasOwn(PRODUCTION_SEEDS, name)) throw new Error('Seed nao permitido em producao.');
  const seed = name as ProductionSeed;
  const auth = authorizeProductionAdmin(seedOperation(seed), process.env, new Date(), readUsedNonces());
  consumeAuthorizationNonce(auth);

  const { client, hostname } = await openReadOnlyClient('DATABASE_URL');
  await client.end();

  const context = createAuthorizedProductionSeedContext(seed);
  try {
    for (const model of PRODUCTION_SEEDS[seed].requires) {
      const delegate = (context.prisma as unknown as Record<string, { count: () => Promise<number> }>)[model];
      if (!delegate || (await delegate.count()) === 0) throw new Error(`Dependencia sem registros: ${model}.`);
    }
    writeAudit(auth, hostname, 'iniciada');
    try {
      await (await MODULES[seed]()).main(context);
      writeAudit(auth, hostname, 'concluida');
    } catch (error) {
      writeAudit(auth, hostname, 'falhou', safeMessage(error));
      throw error;
    }
  } finally {
    await context.prisma.$disconnect();
  }
} catch (error) {
  console.error(JSON.stringify({ result: 'bloqueada', message: safeMessage(error) }));
  process.exitCode = 1;
}
