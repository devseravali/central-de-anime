import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { assertUnique, readRows } from '../../seed/utils/arquivos';
import { backendRoot } from '../../seed/utils/caminhos';
import { inspectLocalImage, normalizeImage } from '../../seed/utils/imagens';
import { newReport } from '../../seed/utils/relatorio';
import { assertReferences } from '../../seed/validacoes/referencias';
import { anime, episodio, personagem } from '../../seed/validacoes/schemas';
import { assertSeedDestination } from '../../seed/config/context';
import { assertFixtureEnvironment } from '../../seed/fixtures/Usuarios';
import { validateInputs } from '../../seed/validacoes/Entrada';

describe('Seeds: contratos das fontes e transformacoes', () => {
  it('prevalida todas as 7521 entradas sem persistencia, preservando divergencias editoriais', async () => {
    const report = await validateInputs();
    expect(report.estado).toBe('concluido');
    expect(report.lidos).toBe(7521);
    expect(report.validos).toBe(7521);
    expect(report.erros).toEqual([]);
    expect(report.avisos.filter(message => message.includes('divergencia de temporada'))).toHaveLength(59);
    expect(report.avisos.filter(message => message.includes('conflito de status'))).toHaveLength(17);
  }, 30000);

  it('valida todos os episodios e preserva as temporadas originais, inclusive zero', async () => {
    const report = newReport('Episodios');
    const rows = await readRows('entidades/episodios.json', episodio, report);
    expect(rows).toHaveLength(4172);
    expect(rows.filter(row => row.temporadaId === 0)).toHaveLength(21);
    expect(rows.find(row => row.id === 3014)?.temporadaId).toBe(19);
    expect(report.validos).toBe(4172);
    assertUnique(rows, row => `${row.animeId}:${row.temporadaId}:${row.numero}`, 'Episodios');
  });

  it('rejeita temporada ausente sem fallback automatico', () => {
    expect(episodio.safeParse({
      id: 1, numero: 1, titulo: 'Teste', sinopse: '', animeId: 1,
    }).success).toBe(false);
    expect(episodio.safeParse({
      id: 1, numero: 1, titulo: 'Teste', sinopse: '', animeId: 1, temporadaId: -1,
    }).success).toBe(false);
  });

  it('importa nivelCombate inteiro ou inteiro textual sem heuristica', () => {
    const base = { id: 1, nome: 'Teste', imagem: 'images/personagens/teste.jpg', sobre: '' };
    expect(personagem.parse({ ...base, nivelCombate: 250 }).nivelCombate).toBe(250);
    expect(personagem.parse({ ...base, nivelCombate: '3' }).nivelCombate).toBe(3);
    for (const nivelCombate of ['', '1.5', '3abc', '2147483648', true, null]) {
      expect(personagem.safeParse({ ...base, nivelCombate }).success).toBe(false);
    }
    expect(personagem.safeParse({ ...base, nivelCombate: 'Avancado' }).success).toBe(false);
    expect(personagem.safeParse(base).success).toBe(false);
  });

  it('valida os 304 valores reais de combate e as estacoes dos 151 animes', async () => {
    const characters = await readRows('entidades/personagens.json', personagem, newReport('Personagens'));
    const source: { id: number; nivelCombate: string | number }[] = JSON.parse(await readFile(
      path.join(backendRoot, 'data', 'entidades', 'personagens.json'), 'utf8',
    ));
    expect(characters).toHaveLength(304);
    for (const row of characters) {
      expect(row.nivelCombate).toBe(Number(source.find(item => item.id === row.id)?.nivelCombate));
    }
    const rows = await readRows('entidades/animes.json', anime, newReport('Animes'));
    expect(rows).toHaveLength(151);
    expect(rows.every(row => [1, 2, 3, 4].includes(row.estacaoId))).toBe(true);
  });

  it('preserva IDs e corrige somente as associacoes de franquia aprovadas', async () => {
    const rows = await readRows('entidades/animes.json', anime, newReport('Animes'));
    expect(rows).toHaveLength(151);
    expect(new Set(rows.map(row => row.id)).size).toBe(151);
    expect(rows.filter(row => row.franquiaId === null)).toHaveLength(30);
    const groups = [
      [[71], 8], [[110, 111, 112, 113], 17], [[126, 127], 19],
      [[128, 129, 130, 131], 11], [[132, 133, 134], 15],
      [[135, 136, 137], 16], [[138, 139], 18],
      [[140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151], 20],
    ] as const;
    for (const [ids, franchise] of groups) {
      for (const id of ids) expect(rows.find(row => row.id === id)?.franquiaId).toBe(franchise);
    }
    for (let id = 114; id <= 125; id++) expect(rows.find(row => row.id === id)?.franquiaId).toBeNull();
    expect(rows.filter(row => row.id >= 17 && row.id <= 22).every(row => row.franquiaId === 4)).toBe(true);
  });

  it('preserva os 17 conflitos de status, sem escolher uma fonte automaticamente', async () => {
    const rows = await readRows('entidades/animes.json', anime, newReport('Animes'));
    const overlay: { animeId: number; statusId: number }[] = JSON.parse(await readFile(
      path.join(backendRoot, 'data', 'relacionamentos', 'anime_status.json'), 'utf8',
    ));
    expect(overlay.filter(row => rows.find(anime => anime.id === row.animeId)?.statusId !== row.statusId)).toHaveLength(17);
  });

  it('bloqueia duplicidades e referencias invalidas sem descartar registros', () => {
    expect(() => assertUnique([{ id: 1 }, { id: 1 }], row => row.id, 'Teste')).toThrow('duplicada');
    expect(() => assertReferences([1, null, 2], [{ id: 1 }], 'Teste')).toThrow('2');
    expect(() => assertReferences([1, null], [{ id: 1 }], 'Teste')).not.toThrow();
  });

  it('preserva os sete aliases de capas sem adicionar host localhost', () => {
    const aliases = [
      ['kimetsu-no-yaiba-mugen-t2.jpg', 'kimestu-no-yaiba-t2.jpg'],
      ['kimetsu-no-yaiba-t4.jpg', 'kimestu-no-yaiba-t4.jpg'],
      ['kimetsu-no-yaiba-t5.jpg', 'kimestu-no-yaiba-t5.jpg'],
      ['kimetsu-no-yaiba-filme-1-akaza-sairai.jpg', 'kimestu-no-yaiba-filme-1-akaza-sairai.jpg'],
      ['jujutsu-kaisen-inventario-oculto.jpg', 'jujutsu-kaisen-kaigyoku-gyokusetsu.jpg'],
      ['jujutsu-kaisen-incidente-de-shibuya.jpg', 'jujutsu-kaisen-shibuya-x-shimetsu.jpg'],
      ['made-in-abyss-the-retsujitsu-no-ougonkyou.jpg', 'made-in-abyss-retsujitsu-no-ougonkyou.jpg'],
    ];
    const report = newReport('Animes');
    for (const [source, target] of aliases) {
      expect(normalizeImage(`../../images/capas/${source}`, report, 1, true)).toBe(`images/capas/${target}`);
    }
    expect(report.avisos).toEqual([]);
  });

  it('preserva imagem ausente como referencia e reporta ausencia e caixa divergente', () => {
    const report = newReport('Episodios');
    const missing = 'images/episodios/arquivo-inexistente.jpg';
    expect(normalizeImage(missing, report, 1)).toBe(missing);
    expect(normalizeImage('images/episodios/one-piece/t13/ep428.jpg', report, 1337)).toContain('ep428.jpg');
    expect(report.avisos).toHaveLength(2);
    expect(normalizeImage(null, report, 2)).toBeNull();
    expect(inspectLocalImage('images/episodios/one-piece/t13/ep428.jpg')).toEqual({
      estado: 'caixa-divergente', caminhoFisico: 'images/episodios/one-piece/t13/EP428.jpg',
    });
  });

  it('rejeita loopback, credenciais e traversal nas imagens', () => {
    const report = newReport('Teste');
    expect(() => normalizeImage('http://localhost:3000/images/a.jpg', report, 1)).toThrow('loopback');
    expect(() => normalizeImage('https://user:secret@example.test/a.jpg', report, 1)).toThrow('credenciais');
    expect(() => normalizeImage('images/../../a.jpg', report, 1)).toThrow('invalido');
  });

  it('reutiliza listagens por validacao sem ocultar ausencias ou divergencias de caixa', () => {
    const directoryEntries = new Map<string, string[]>();
    const image = 'images/episodios/one-piece/t13/ep428.jpg';
    const expected = inspectLocalImage(image);
    const readdir = vi.spyOn(fs, 'readdirSync');
    try {
      expect(inspectLocalImage(image, directoryEntries)).toEqual(expected);
      const reads = readdir.mock.calls.length;
      expect(reads).toBeGreaterThan(0);
      expect(inspectLocalImage(image, directoryEntries)).toEqual(expected);
      expect(readdir).toHaveBeenCalledTimes(reads);
      expect(inspectLocalImage('images/episodios/one-piece/t13/arquivo-inexistente.jpg', directoryEntries))
        .toEqual({ estado: 'ausente' });
      expect(readdir).toHaveBeenCalledTimes(reads);
      expect(inspectLocalImage(image, new Map())).toEqual(expected);
      expect(readdir).toHaveBeenCalledTimes(reads * 2);
    } finally {
      readdir.mockRestore();
    }
  });

  it('bloqueia destino remoto, staging e producao mesmo com flags antigas', () => {
    const env = { APP_ENV: 'local', DATABASE_URL: 'postgresql://example.test/centraldeanime', DATABASE_URL_UNPOOLED: 'postgresql://example.test/centraldeanime' };
    expect(() => assertSeedDestination(env)).toThrow('local');
    for (const APP_ENV of ['production', 'staging']) {
      expect(() => assertSeedDestination({
        ...env, APP_ENV, SEED_ALLOW_REMOTE: 'true', SEED_ALLOW_PRODUCTION: 'true',
      })).toThrow('bloqueados');
    }
    expect(assertSeedDestination({
      APP_ENV: 'local', DATABASE_URL: 'postgresql://localhost/centraldeanime',
      DATABASE_URL_UNPOOLED: 'postgresql://localhost/centraldeanime',
    })).toContain('localhost');
  });

  it('fixtures exigem ambiente test, banco local e autorizacao separada', () => {
    expect(() => assertFixtureEnvironment({ NODE_ENV: 'production' })).toThrow('Fixtures');
    expect(() => assertFixtureEnvironment({
      APP_ENV: 'test', NODE_ENV: 'test', SEED_ALLOW_FIXTURES: 'true',
      DATABASE_URL: 'postgresql://example.test/centraldeanimetest',
      DATABASE_URL_UNPOOLED: 'postgresql://example.test/centraldeanimetest',
    })).toThrow('local');
  });
});
