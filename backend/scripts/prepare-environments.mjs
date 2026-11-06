import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

const root = new URL('../', import.meta.url);
const legacy = new URL('.env.test', root);
const credentials = existsSync(legacy) ? parse(readFileSync(legacy)) : process.env;
if (!credentials.DATABASE_URL) throw new Error('Conexao local de testes obrigatoria para preparar os arquivos.');
const source = new URL(credentials.DATABASE_URL);
if (!['postgres:', 'postgresql:'].includes(source.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(source.hostname) ||
    source.pathname !== '/centraldeanimetest' || (source.port || '5432') !== '5432') {
  throw new Error('Preparacao exige credenciais do PostgreSQL local de testes.');
}

for (const [environment, filename, database, port] of [
  ['local', '.env.local', 'centraldeanime', '3000'],
  ['staging', '.env.staging', 'centraldeanime_staging', '3001'],
  ['test', '.env.test.local', 'centraldeanimetest', '3002'],
]) {
  const target = new URL(filename, root);
  if (existsSync(target)) {
    console.info(`${filename}: preservado, ja existe.`);
    continue;
  }
  const url = new URL(source);
  url.pathname = `/${database}`;
  url.search = '';
  url.hash = '';
  const values = {
    APP_ENV: environment,
    DATABASE_URL: url.toString(),
    DATABASE_URL_UNPOOLED: url.toString(),
    JWT_SECRET: randomBytes(48).toString('hex'),
    JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
    SESSION_STORE: 'memory',
    MAIL_MODE: 'disabled',
    MAIL_FROM: 'noreply@example.invalid',
    FRONTEND_URL: 'http://localhost:5173',
    PORT: port,
  };
  writeFileSync(target, Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', {
    encoding: 'utf8', mode: 0o600, flag: 'wx',
  });
  console.info(`${fileURLToPath(target)}: criado; nenhuma conexao realizada.`);
}
