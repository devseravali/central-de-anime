import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { assertPrismaArguments } from '../src/config/prismaArguments.mjs';
import {
  assertValidationReplayArguments, loadValidationMigrationEnvironment, validationHost, validationPort, validationRole,
} from '../src/config/validationEnvironment.mjs';

const args = process.argv.slice(2);
const validation = process.env.APP_ENV === 'validation';
let childEnv;
try {
  assertPrismaArguments(args);
  if (validation) {
    assertValidationReplayArguments(args);
    const { database, connectionUrl } = loadValidationMigrationEnvironment(process.env);
    childEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
      /^(?:SystemRoot|WINDIR|PATH|TEMP|TMP|HOME|USERPROFILE|LOCALAPPDATA|APPDATA)$/i.test(key)));
    Object.assign(childEnv, {
      APP_ENV: 'validation', VALIDATION_OPERATION: process.env.VALIDATION_OPERATION,
      DATABASE_URL: connectionUrl, DATABASE_URL_UNPOOLED: connectionUrl,
      CHECKPOINT_DISABLE: '1', PRISMA_HIDE_UPDATE_MESSAGE: '1',
    });
    console.log(`Migration de validacao (${process.env.VALIDATION_OPERATION}): ${validationRole}@${validationHost}:${validationPort}/${database}.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Argumentos Prisma invalidos.');
  process.exitCode = 1;
}

if (!process.exitCode) {
  try {
    const require = createRequire(import.meta.url);
    const child = spawn(process.execPath, [require.resolve('prisma/build/index.js'), ...args], {
      stdio: validation ? 'ignore' : 'inherit',
      env: childEnv,
      cwd: validation ? fileURLToPath(new URL('../', import.meta.url)) : undefined,
      shell: false,
    });
    child.on('error', () => {
      console.error('Nao foi possivel iniciar o Prisma CLI.');
      process.exitCode = 1;
    });
    child.on('exit', code => {
      if (validation) {
        if (code === 0) console.log('Migration de validacao concluida.');
        else console.error('Migration de validacao falhou; saida do Prisma omitida para proteger credenciais.');
      }
      process.exitCode = code ?? 1;
    });
  } catch {
    console.error('Nao foi possivel iniciar o Prisma CLI.');
    process.exitCode = 1;
  }
}
