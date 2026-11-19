import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { MIGRATION_MANIFEST } from '../../src/config/migrationManifest';

try {
  const directory = resolve(import.meta.dirname, '..', '..', 'prisma', 'migrations');
  const names = readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(Object.keys(MIGRATION_MANIFEST).sort())) throw new Error('Lista de migrations diverge do manifesto revisado.');
  for (const name of names) {
    const sql = readFileSync(join(directory, name, 'migration.sql'), 'utf8').replace(/\r\n/g, '\n');
    const hash = createHash('sha256').update(sql).digest('hex');
    if (hash !== MIGRATION_MANIFEST[name]) throw new Error(`Checksum divergente: ${name}.`);
  }
  console.log(JSON.stringify({ result: 'concluida', migrations: names, remoteState: 'nao verificado', schemaReplay: 'nao executado' }));
} catch (error) {
  console.error(JSON.stringify({ result: 'falhou', message: error instanceof Error ? error.message : 'Falha ao verificar migrations.' }));
  process.exitCode = 1;
}
