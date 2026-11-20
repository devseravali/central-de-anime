import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ root: '' }));
vi.mock('../../seed/utils/caminhos', () => ({
  get backendRoot() { return path.join(state.root, 'backend'); },
  get dataRoot() { return path.join(state.root, 'backend', 'data'); },
}));

describe('Snapshot de fontes aprovadas', () => {
  afterAll(() => {
    if (state.root) fs.rmSync(state.root, { recursive: true, force: true });
  });

  it('continua usando os bytes aprovados apos alteracao no arquivo de teste em disco', async () => {
    state.root = fs.mkdtempSync(path.join(os.tmpdir(), 'central-anime-snapshot-'));
    const data = path.join(state.root, 'backend', 'data', 'entidades');
    const docs = path.join(state.root, 'docs');
    fs.mkdirSync(data, { recursive: true });
    fs.mkdirSync(docs, { recursive: true });
    fs.copyFileSync(path.resolve('..', 'docs', 'json-inventory.json'), path.join(docs, 'json-inventory.json'));
    const source = path.join(data, 'personagens.json');
    const approved = fs.readFileSync(path.resolve('data', 'entidades', 'personagens.json'));
    fs.writeFileSync(source, approved);
    const { captureSources } = await import('../../seed/utils/fontes');
    const snapshot = await captureSources(['entidades/personagens.json']);
    fs.writeFileSync(source, '[{"id":999}]');
    expect(snapshot('entidades/personagens.json')).toBe(approved.toString('utf8'));
    expect(JSON.parse(snapshot('entidades/personagens.json'))).toEqual(JSON.parse(approved.toString('utf8')));
    expect(() => snapshot('entidades/animes.json')).toThrow('nao capturada');
  });
});
