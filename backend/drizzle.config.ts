import { defineConfig } from 'drizzle-kit';
import { resolve } from 'path';
import { config } from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: resolve(__dirname, envFile) });

const schemaPath = resolve(__dirname, 'src', 'schema');
const outPath = resolve(__dirname, 'drizzle');

export default defineConfig({
  schema: `${schemaPath}/**/*.ts`,
  out: outPath,
  dialect: 'postgresql',
  dbCredentials: {
    url:
      (process.env.NODE_ENV === 'test'
        ? process.env.DATABASE_TEST_URL
        : process.env.DATABASE_URL) || '',
  },
});
