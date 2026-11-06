import { defineConfig } from 'prisma/config';
import { prismaCliConfiguration } from './src/config/environment';

const cli = prismaCliConfiguration(process.argv.slice(2));

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: cli.migrationsPath ?? 'prisma/migrations',
    seed: 'npm run seed:all',
  },
  ...(cli.datasourceUrl ? { datasource: { url: cli.datasourceUrl } } : {}),
});
