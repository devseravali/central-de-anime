import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { backendRoot, dataRoot } from './caminhos';
import { SeedInputError } from './relatorio';

export const seedSources: Readonly<Record<string, readonly string[]>> = Object.freeze({
  Status: ['entidades/status.json'],
  Generos: ['entidades/generos.json'],
  Estudios: ['entidades/estudios.json'],
  Plataformas: ['entidades/plataformas.json'],
  Tags: ['entidades/tags.json'],
  Franquias: ['entidades/franquia.json'],
  Capas: ['entidades/capa.json'],
  Estacoes: ['entidades/estacoes.json'],
  Animes: ['entidades/animes.json', 'relacionamentos/anime_status.json'],
  Personagens: ['entidades/personagens.json'],
  Episodios: ['entidades/episodios.json'],
  AnimeGenero: ['relacionamentos/anime_genero.json'],
  AnimePersonagem: ['relacionamentos/anime_personagem.json'],
  AnimePlataforma: ['relacionamentos/anime_plataforma.json'],
  AnimeTag: ['relacionamentos/anime_tag.json'],
  AnimeStatus: ['relacionamentos/anime_status.json', 'entidades/animes.json'],
});

for (const sources of Object.values(seedSources)) Object.freeze(sources);
export const allSeedSources = Object.freeze([...new Set(Object.values(seedSources).flat())]);
export type SourceSnapshot = (relative: string) => string;

export async function captureSources(files: readonly string[]): Promise<SourceSnapshot> {
  let inventory: unknown;
  try {
    inventory = JSON.parse(await readFile(path.join(backendRoot, '..', 'docs', 'json-inventory.json'), 'utf8'));
  } catch {
    throw new SeedInputError('Inventario oficial ausente, inacessivel ou invalido.');
  }
  if (!inventory || typeof inventory !== 'object' || !('files' in inventory) || !Array.isArray(inventory.files)) {
    throw new SeedInputError('Inventario oficial invalido.');
  }
  const hashes = new Map<string, string>();
  for (const entry of inventory.files) {
    if (!entry || typeof entry !== 'object' || typeof entry.path !== 'string' ||
        typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256) ||
        !entry.path.startsWith('data/')) {
      throw new SeedInputError('Entrada invalida no inventario oficial.');
    }
    const relative = entry.path.slice('data/'.length);
    if (!allSeedSources.includes(relative) || hashes.has(relative)) {
      throw new SeedInputError('Inventario oficial contem arquivo inesperado ou duplicado.');
    }
    hashes.set(relative, entry.sha256);
  }
  if (hashes.size !== allSeedSources.length || allSeedSources.length !== 16) {
    throw new SeedInputError('Inventario oficial incompleto.');
  }
  const contents = new Map<string, string>();
  for (const relative of new Set(files)) {
    const expected = hashes.get(relative);
    if (!expected) throw new SeedInputError(`Fonte nao autorizada: ${relative}.`);
    let bytes: Buffer;
    try {
      bytes = await readFile(path.join(dataRoot, relative));
    } catch {
      throw new SeedInputError(`${relative}: fonte oficial ausente ou inacessivel.`);
    }
    if (createHash('sha256').update(bytes).digest('hex') !== expected) {
      throw new SeedInputError(`${relative}: SHA-256 diverge do inventario oficial.`);
    }
    contents.set(relative, bytes.toString('utf8'));
  }
  return (relative: string) => {
    const content = contents.get(relative);
    if (content === undefined) throw new SeedInputError(`Fonte nao capturada: ${relative}.`);
    return content;
  };
}
