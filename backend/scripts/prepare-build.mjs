import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);

await rm(fileURLToPath(dist), { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const directory of ['data', 'images']) {
  await cp(
    fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
    fileURLToPath(new URL(`${directory}/`, dist)),
    { recursive: true }
  );
}
