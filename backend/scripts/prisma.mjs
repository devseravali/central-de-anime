import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { assertPrismaArguments } from '../src/config/prismaArguments.mjs';

const args = process.argv.slice(2);
try {
  assertPrismaArguments(args);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Argumentos Prisma invalidos.');
  process.exitCode = 1;
}

if (!process.exitCode) {
  const require = createRequire(import.meta.url);
  const child = spawn(process.execPath, [require.resolve('prisma/build/index.js'), ...args], {
    stdio: 'inherit',
    shell: false,
  });
  child.on('error', () => {
    console.error('Nao foi possivel iniciar o Prisma CLI.');
    process.exitCode = 1;
  });
  child.on('exit', code => {
    process.exitCode = code ?? 1;
  });
}
