import path from 'node:path';
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => {
  type Row = Record<string, unknown>;
  const tables = new Map<string, Map<string, Row>>();
  const writes = vi.fn();
  const constructor = vi.fn();
  const disconnect = vi.fn();
  const transaction = vi.fn();
  const identity = vi.fn();
  const files: Record<string, Row[]> = {};
  const overrides: Record<string, string | null> = {};
  const state: { inventory?: string } = {};
  function delegate(name: string, keys = ['id']) {
    const key = (row: Row) => keys.map(k => String(row[k])).join(':');
    const table = () => {
      if (!tables.has(name)) tables.set(name, new Map());
      return tables.get(name)!;
    };
    return {
      findMany: vi.fn(async (args?: { where?: { id?: { in: number[] } } }) => [...table().values()]
        .filter(row => !args?.where?.id?.in || args.where.id.in.includes(Number(row.id)))),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: number } }) => {
        const row = table().get(String(where.id));
        if (!row) throw new Error('Missing');
        return row;
      }),
      create: vi.fn(async ({ data }: { data: Row }) => {
        if (table().has(key(data))) throw new Error('Duplicate');
        writes(name, 'create', data);
        table().set(key(data), { ...data });
        return data;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Row }) => {
        if ('id' in data) throw new Error('ID mutation');
        const previous = table().get(String(where.id));
        if (!previous) throw new Error('Missing');
        const row = { ...previous, ...data };
        writes(name, 'update', data);
        table().set(String(where.id), row);
        return row;
      }),
      createMany: vi.fn(async ({ data }: { data: Row[] }) => {
        for (const row of data) {
          if (table().has(key(row))) throw new Error('Duplicate');
          table().set(key(row), { ...row });
        }
        writes(name, 'createMany', data);
        return { count: data.length };
      }),
    };
  }
  const database = {
    status: delegate('Status'),
    estacao: delegate('Estacao'),
    genero: delegate('Genero'),
    estudio: delegate('Estudio'),
    plataforma: delegate('Plataforma'),
    animeTag: delegate('AnimeTag'),
    franquia: delegate('Franquia'),
    capas: delegate('Capas'),
    anime: delegate('Anime'),
    personagem: delegate('Personagem'),
    episodio: delegate('Episodio'),
    animeGenero: delegate('AnimeGenero', ['animeId', 'generoId']),
    animePersonagem: delegate('AnimePersonagem', ['animeId', 'personagemId']),
    animePlataforma: delegate('AnimePlataforma', ['animeId', 'plataformaId']),
    animeTagAnime: delegate('AnimeTagAnime', ['animeId', 'tagId']),
    $transaction: transaction,
    $disconnect: disconnect,
  };
  transaction.mockImplementation(async (callback: (db: typeof database) => Promise<unknown>) => {
    const backup = new Map([...tables].map(([name, rows]) => [name, new Map(rows)]));
    try {
      return await callback(database);
    } catch (error) {
      tables.clear();
      for (const [name, rows] of backup) tables.set(name, rows);
      throw error;
    }
  });
  const transactionDatabase = { ...database, $queryRaw: identity, $transaction: undefined, $disconnect: undefined };
  const validationClient = { $transaction: transaction, $disconnect: disconnect };
  return { tables, files, overrides, state, database, transactionDatabase, validationClient, identity, transaction, writes, constructor, disconnect };
});

vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      harness.constructor();
      return process.env.APP_ENV === 'validation' ? harness.validationClient : harness.database;
    }
  },
}));
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
vi.mock('../../config/environment', async importOriginal => ({
  ...await importOriginal<typeof import('../../config/environment')>(),
  loadEnvironment: vi.fn(),
}));
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async (filename: string, encoding?: string) => {
    const basename = path.basename(filename);
    if (basename === 'json-inventory.json') {
      if (harness.state.inventory !== undefined) return harness.state.inventory;
      const { createHash } = await import('node:crypto');
      const { allSeedSources } = await import('../../seed/utils/fontes');
      return JSON.stringify({ files: allSeedSources.map(relative => ({
        path: `data/${relative}`,
        sha256: createHash('sha256').update(JSON.stringify(harness.files[path.basename(relative)])).digest('hex'),
      })) });
    }
    if (harness.overrides[basename] === null) throw new Error('ENOENT');
    const rows = harness.files[basename];
    if (!rows) throw new Error('ENOENT');
    const contents = harness.overrides[basename] ?? JSON.stringify(rows);
    return encoding ? contents : Buffer.from(contents);
  }),
}));

import { modules } from '../../seed/config/modulos';
import { main as all } from '../../seed/index';
import { main as animes } from '../../seed/entidades/Animes';
import { main as personagens } from '../../seed/entidades/Personagens';
import { main as episodios } from '../../seed/entidades/Episodios';
import { main as animeTag } from '../../seed/relacionamentos/AnimeTag';
import { main as animeStatus } from '../../seed/atualizacoes/AnimeStatus';
import { runDirect } from '../../seed/utils/executar';
import { readFile } from 'node:fs/promises';
import { backendRoot } from '../../seed/utils/caminhos';
import { createSeedContext, withValidatedImport, type SeedContext } from '../../seed/config/context';
import { allSeedSources, seedSources } from '../../seed/utils/fontes';
import { readRows } from '../../seed/utils/arquivos';
import { newReport } from '../../seed/utils/relatorio';
import { personagem } from '../../seed/validacoes/schemas';

beforeEach(() => {
  vi.clearAllMocks();
  harness.tables.clear();
  for (const key of Object.keys(harness.overrides)) delete harness.overrides[key];
  harness.state.inventory = undefined;
  Object.assign(harness.files, {
    'status.json': [{ id: 1, nome: 'Concluido' }, { id: 2, nome: 'Planejado' }],
    'generos.json': [{ id: 1, nome: 'Aventura' }],
    'estudios.json': [{ id: 1, nome: 'Estudio', principaisObras: '' }],
    'plataformas.json': [{ id: 1, nome: 'Plataforma' }],
    'tags.json': [{ id: 1, nome: 'Tag' }],
    'franquia.json': [{ id: 1, nome: 'Franquia', descricao: null, anoInicio: 2017 }],
    'capa.json': [{ id: 1, nome_original: 'capa.jpg', nome_salvo: 'capa.jpg', caminho: 'images/capas/ausente.jpg', mime_type: 'image/jpeg' }],
    'estacoes.json': [{ id: 1, nome: 'Verao' }],
    'animes.json': [{
      id: 1, titulo: 'Anime', tipo: 'filme', temporada: 0, ano: 2017, sinopse: '',
      capaUrl: null, quantidadeEpisodios: 1, franquiaId: 1, estudioId: 1, statusId: 1, estacaoId: 1,
    }],
    'personagens.json': [{ id: 1, nome: 'Personagem', imagem: 'images/personagens/ausente.jpg', sobre: '', nivelCombate: 250 }],
    'episodios.json': [{ id: 1, numero: 1, titulo: 'Episodio', sinopse: '', temporadaId: 0, animeId: 1, imagemUrl: 'images/episodios/ausente.jpg' }],
    'anime_genero.json': [{ animeId: 1, generoId: 1 }],
    'anime_personagem.json': [{ animeId: 1, personagemId: 1 }],
    'anime_plataforma.json': [{ animeId: 1, plataformaId: 1 }],
    'anime_tag.json': [{ animeId: 1, tagId: 1 }],
    'anime_status.json': [{ animeId: 1, statusId: 2 }],
  });
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('NODE_ENV', 'test');
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('Seeds: modulos reais com persistencia simulada', () => {
  it('executa todos os 16 main diretamente, sem depender de index, fechando cada conexao', async () => {
    const reports = [];
    for (const main of modules) reports.push(await main());
    expect(reports.every(report => report.estado === 'concluido')).toBe(true);
    expect(harness.constructor).toHaveBeenCalledTimes(16);
    expect(harness.disconnect).toHaveBeenCalledTimes(16);
    expect(harness.tables.get('Personagem')?.get('1')?.nivelCombate).toBe(250);
    expect(harness.tables.get('Episodio')?.get('1')?.temporada).toBe(0);
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
    expect(harness.tables.get('Anime')?.get('1')?.estacaoId).toBe(1);
  });

  it('orquestrador reutiliza uma unica instancia e retorna relatorio consolidado', async () => {
    const reports = await all();
    expect(reports).toHaveLength(17);
    expect(harness.constructor).toHaveBeenCalledTimes(1);
    expect(harness.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.tables.get('AnimeTagAnime')?.size).toBe(1);
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
  });

  it('reexecucao do conjunto nao duplica IDs nem pares, mantendo o estado final das fontes', async () => {
    await all();
    const snapshot = JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]));
    const reports = await all();
    expect(reports.slice(1).reduce((sum, report) => sum + report.inseridos, 0)).toBe(0);
    expect(reports.slice(1).reduce((sum, report) => sum + report.atualizados, 0)).toBe(0);
    expect(JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]))).toBe(snapshot);
  });

  it('persiste caminhos literalmente nas quatro entidades, inclusive os sete animes oficiais, e na reexecucao', async () => {
    const ids = [8, 10, 11, 12, 20, 21, 137];
    const source: { id: number; capaUrl: string }[] = JSON.parse(fs.readFileSync(
      path.join(backendRoot, 'data', 'entidades', 'animes.json'), 'utf8',
    ));
    for (const id of ids) {
      const original = source.find(row => row.id === id);
      expect(original).toBeDefined();
      harness.files['animes.json'].push({
        ...harness.files['animes.json'][0], id, capaUrl: original?.capaUrl, titulo: `Anime ${id}`,
      });
    }
    harness.files['animes.json'][0].capaUrl = '..\\..\\images\\capas\\Título-Original.JpG';
    harness.files['capa.json'][0].caminho = '../../images/capas/Capa-Original.PNG';
    harness.files['personagens.json'][0].imagem = '..\\..\\images\\personagens\\Personagem-Original.WeBp';
    harness.files['episodios.json'][0].imagemUrl = '../../images/episodios/Episódio-Original.JPEG';

    await all();
    for (const row of harness.files['animes.json']) {
      expect(harness.tables.get('Anime')?.get(String(row.id))?.capaUrl).toBe(row.capaUrl);
    }
    expect(harness.tables.get('Capas')?.get('1')?.caminho).toBe(harness.files['capa.json'][0].caminho);
    expect(harness.tables.get('Personagem')?.get('1')?.imagem).toBe(harness.files['personagens.json'][0].imagem);
    expect(harness.tables.get('Episodio')?.get('1')?.imagemUrl).toBe(harness.files['episodios.json'][0].imagemUrl);
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);

    const reports = await all();
    expect(reports.slice(1).reduce((sum, report) => sum + report.inseridos, 0)).toBe(0);
    const snapshot = JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]));
    await all();
    expect(JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]))).toBe(snapshot);
    harness.tables.get('Anime')!.get('8')!.capaUrl = 'images/capas/kimestu-no-yaiba-t2.jpg';
    await expect(all()).rejects.toMatchObject({
      report: { estado: 'falhou', erros: [expect.stringContaining('nenhuma sobrescrita autorizada')] },
    });
  });

  it('preflight impede qualquer gravacao quando personagens tem nivelCombate textual', async () => {
    harness.files['personagens.json'][0].nivelCombate = 'Avancado';
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('preflight bloqueia estacao inexistente antes de abrir uma conexao', async () => {
    harness.files['animes.json'][0].estacaoId = 99;
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('preflight rejeita JSON invalido sem criar conexao ou gravar', async () => {
    vi.mocked(readFile).mockResolvedValueOnce('{');
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.constructor).not.toHaveBeenCalled();
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('preflight rejeita campo obrigatorio ausente identificando o registro', async () => {
    delete harness.files['animes.json'][0].titulo;
    await expect(all()).rejects.toMatchObject({
      report: { estado: 'falhou', erros: [expect.stringContaining('id=1')] },
    });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('preflight rejeita IDs duplicados e pares orfaos sem gravar', async () => {
    harness.files['status.json'].push({ id: 1, nome: 'Duplicado' });
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    harness.files['status.json'].pop();
    harness.files['anime_personagem.json'][0].personagemId = 999;
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('animes exige estacoes persistidas mesmo quando os outros catalogos existem', async () => {
    for (const name of ['Estudio', 'Franquia']) {
      harness.tables.set(name, new Map([['1', { id: 1 }]]));
    }
    harness.tables.set('Status', new Map([['1', { id: 1 }], ['2', { id: 2 }]]));
    await expect(animes()).rejects.toMatchObject({
      report: { estado: 'falhou', erros: ['Animes.estacaoId: IDs ausentes 1.'] },
    });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('personagens valida seu proprio arquivo sem importar auxiliares ou outros JSONs', async () => {
    const report = await personagens();
    expect(report.inseridos).toBe(1);
    expect([...harness.tables.keys()]).toEqual(['Personagem']);
  });

  it('anime independente falha antes de gravar se seus catalogos nao estiverem persistidos', async () => {
    await expect(animes()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.disconnect).toHaveBeenCalledTimes(1);
  });

  it('relacionamento valida tambem o lado da tag antes de gravar', async () => {
    harness.tables.set('Anime', new Map([['1', { id: 1 }]]));
    await expect(animeTag()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('episodio mantem temporada divergente e imagem ausente, reportando ambos sem descartar', async () => {
    harness.tables.set('Anime', new Map([['1', { id: 1, temporada: 2 }]]));
    const report = await episodios();
    expect(report.inseridos).toBe(1);
    expect(report.avisos).toHaveLength(2);
    expect(harness.tables.get('Episodio')?.get('1')?.temporada).toBe(0);
    expect(harness.tables.get('Episodio')?.get('1')?.imagemUrl).toBe('images/episodios/ausente.jpg');
  });

  it('AnimeStatus preserva identicos e bloqueia divergencia sem atualizar', async () => {
    await all();
    const report = await animeStatus();
    expect(report.inalterados).toBe(1);
    expect(report.atualizados).toBe(0);
    expect(harness.database.anime.update).not.toHaveBeenCalled();
    harness.tables.get('Anime')!.get('1')!.statusId = 1;
    await expect(animeStatus()).rejects.toMatchObject({
      report: { erros: [expect.stringContaining('animeId=1, status existente=1, prioritario=2')] },
    });
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(1);
    expect(harness.database.anime.update).not.toHaveBeenCalled();
  });

  it('Animes insere status prioritario e preserva o da origem quando nao ha overlay', async () => {
    harness.files['animes.json'].push({ ...harness.files['animes.json'][0], id: 2, titulo: 'Segundo' });
    await all();
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
    expect(harness.tables.get('Anime')?.get('2')?.statusId).toBe(1);
    await all();
    expect(harness.database.anime.update).not.toHaveBeenCalled();
  });

  it('AnimeStatus nao cria anime ausente na fonte nem no banco', async () => {
    harness.files['anime_status.json'].push({ animeId: 99, statusId: 1 });
    await expect(animeStatus()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.database.anime.create).not.toHaveBeenCalled();
    expect(harness.database.anime.update).not.toHaveBeenCalled();
  });

  it('AnimeStatus nao cria anime presente na fonte mas ausente no banco', async () => {
    harness.tables.set('Status', new Map([['2', { id: 2 }]]));
    await expect(animeStatus()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.database.anime.create).not.toHaveBeenCalled();
    expect(harness.database.anime.update).not.toHaveBeenCalled();
  });

  it('execucao direta sinaliza exit code 1 quando main falha', async () => {
    const originalArg = process.argv[1];
    const originalCode = process.exitCode;
    process.argv[1] = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
    try {
      runDirect(import.meta.url, async () => { throw new Error('simulada'); });
      await new Promise(resolve => setImmediate(resolve));
      expect(process.exitCode).toBe(1);
    } finally {
      process.argv[1] = originalArg;
      process.exitCode = originalCode;
    }
  });

  describe('Importacao validation: transacao e identidade na sessao de escrita', () => {
    const validIdentity = {
      database: 'centraldeanime_import_validation_20261112',
      role: 'centraldeanime_validation', host: '127.0.0.1', port: 55432,
    };
    beforeEach(() => {
      const password = 'a'.repeat(96);
      const url = `postgresql://centraldeanime_validation:${password}@127.0.0.1:55432/centraldeanime_import_validation_20261112`;
      vi.stubEnv('APP_ENV', 'validation');
      vi.stubEnv('VALIDATION_OPERATION', 'import');
      vi.stubEnv('DATABASE_URL', url);
      vi.stubEnv('DATABASE_URL_UNPOOLED', url);
      harness.identity.mockResolvedValue([validIdentity]);
      harness.transaction.mockImplementation(async (callback: (db: typeof harness.transactionDatabase) => Promise<unknown>) => {
        const backup = new Map([...harness.tables].map(([name, rows]) => [
          name, new Map([...rows].map(([key, row]) => [key, { ...row }])),
        ]));
        try {
          return await callback(harness.transactionDatabase);
        } catch (error) {
          harness.tables.clear();
          for (const [name, rows] of backup) harness.tables.set(name, rows);
          throw error;
        }
      });
    });

    it.each([
      ['banco', { ...validIdentity, database: 'outro' }],
      ['role', { ...validIdentity, role: 'outra' }],
      ['host', { ...validIdentity, host: '127.0.0.2' }],
      ['porta', { ...validIdentity, port: 5432 }],
      ['campo ausente', { ...validIdentity, host: null }],
    ])('bloqueia %s divergente antes de qualquer escrita apesar de URL valida', async (_label, actual) => {
      harness.identity.mockResolvedValue([actual]);
      await expect(all()).rejects.toThrow();
      expect(harness.transaction).toHaveBeenCalledTimes(1);
      expect(harness.identity).toHaveBeenCalledTimes(1);
      expect(harness.writes).not.toHaveBeenCalled();
      expect(harness.disconnect).toHaveBeenCalledTimes(1);
    });

    it('bloqueia resposta de identidade ausente ou ambigua', async () => {
      for (const rows of [[], [validIdentity, validIdentity]]) {
        harness.identity.mockResolvedValueOnce(rows);
        await expect(all()).rejects.toThrow();
      }
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it('bloqueia destino divergente antes de criar o cliente, sem fallback', async () => {
      vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://localhost/centraldeanimetest');
      await expect(all()).rejects.toThrow();
      expect(harness.constructor).not.toHaveBeenCalled();
      expect(harness.transaction).not.toHaveBeenCalled();
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it.each(['alterado', 'ausente'])('bloqueia fonte %s antes de qualquer escrita', async condition => {
      harness.overrides['episodios.json'] = condition === 'ausente' ? null : '[{"id":999}]';
      await expect(all()).rejects.toThrow();
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it.each(['incompleto', 'inesperado', 'duplicado'])('bloqueia inventario %s antes de escrever', async condition => {
      const manifest = JSON.parse(String(await readFile('json-inventory.json', 'utf8')));
      if (condition === 'incompleto') manifest.files.pop();
      if (condition === 'inesperado') manifest.files[0].path = 'data/entidades/extra.json';
      if (condition === 'duplicado') manifest.files[0] = manifest.files[1];
      harness.state.inventory = JSON.stringify(manifest);
      await expect(all()).rejects.toThrow();
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it('mantem snapshot aprovado mesmo quando a fonte muda depois da captura', async () => {
      const original = String(harness.files['personagens.json'][0].nome);
      await withValidatedImport(async context => {
        harness.files['personagens.json'][0].nome = 'alterado depois';
        await personagens(context);
      });
      expect(harness.tables.get('Personagem')?.get('1')?.nome).toBe(original);
      const fileReads = vi.mocked(readFile).mock.calls.filter(([filename]) =>
        path.basename(String(filename)) === 'personagens.json');
      expect(fileReads).toHaveLength(1);
    });

    it('rejeita leitura sem contexto validado e isola alteracoes nos objetos analisados', async () => {
      await expect(readRows('entidades/personagens.json', personagem, newReport('Teste'))).rejects.toThrow('snapshot');
      await withValidatedImport(async context => {
        const first = await readRows('entidades/personagens.json', personagem, newReport('Teste'), context);
        first[0].nome = 'alterado em memoria';
        const second = await readRows('entidades/personagens.json', personagem, newReport('Teste'), context);
        expect(second[0].nome).toBe(harness.files['personagens.json'][0].nome);
      });
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it.each(['alterado', 'ausente'])('runner individual bloqueia arquivo nao utilizado %s', async condition => {
      harness.overrides['episodios.json'] = condition === 'ausente' ? null : '[{"id":999}]';
      await expect(personagens()).rejects.toMatchObject({ report: { estado: 'falhou' } });
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it('cada runner individual captura as 16 fontes e bloqueia divergencia em outra fonte', async () => {
      await all();
      for (const main of modules) {
        vi.mocked(readFile).mockClear();
        const report = await main();
        const actual = vi.mocked(readFile).mock.calls
          .map(([filename]) => path.basename(String(filename)))
          .filter(filename => filename !== 'json-inventory.json')
          .sort();
        expect(actual).toEqual(allSeedSources.map(relative => path.basename(relative)).sort());
        const other = allSeedSources.find(relative => !seedSources[report.modulo].includes(relative));
        if (!other) throw new Error(`Nenhuma outra fonte para ${report.modulo}`);
        const filename = path.basename(other);
        harness.overrides[filename] = '[]';
        harness.writes.mockClear();
        await expect(main()).rejects.toMatchObject({ report: { estado: 'falhou' } });
        expect(harness.writes).not.toHaveBeenCalled();
        delete harness.overrides[filename];
      }
    });

    it('todos os modulos usam somente o tx verificado e a verificacao precede as escritas', async () => {
      const reports = await all();
      expect(reports).toHaveLength(17);
      expect(harness.transaction).toHaveBeenCalledTimes(1);
      expect(harness.identity).toHaveBeenCalledTimes(1);
      const sql = String(harness.identity.mock.calls[0][0]);
      for (const expression of ['current_database()', 'current_user', 'inet_server_addr()', 'inet_server_port()']) {
        expect(sql).toContain(expression);
      }
      expect(harness.writes).toHaveBeenCalled();
      for (const relative of allSeedSources) {
        expect(vi.mocked(readFile).mock.calls.filter(([filename]) =>
          path.basename(String(filename)) === path.basename(relative))).toHaveLength(1);
      }
      expect(harness.identity.mock.invocationCallOrder[0]).toBeLessThan(harness.writes.mock.invocationCallOrder[0]);
      expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
      expect(harness.database.anime.update).not.toHaveBeenCalled();
      expect(harness.disconnect).toHaveBeenCalledTimes(1);
    });

    it('falha tardia reverte escritas anteriores e nao confirma os relatorios', async () => {
      harness.database.episodio.create.mockRejectedValueOnce(new Error('falha simulada'));
      await expect(all()).rejects.toThrow();
      expect(harness.writes).toHaveBeenCalled();
      expect([...harness.tables.values()].every(table => table.size === 0)).toBe(true);
      expect(harness.disconnect).toHaveBeenCalledTimes(1);
    });

    it('distingue falha de encerramento apos commit de uma transacao revertida', async () => {
      harness.disconnect.mockRejectedValueOnce(new Error('credential-secret'));
      await expect(all()).rejects.toThrow('Importacao confirmada, mas falhou o encerramento');
      expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
      const output = JSON.stringify(vi.mocked(console.log).mock.calls);
      expect(output).not.toContain('credential-secret');
      expect(output).not.toContain('Transacao sem confirmacao de commit');
    });

    it('execucao individual tambem usa a transacao e consulta de identidade', async () => {
      const report = await personagens();
      expect(report.inseridos).toBe(1);
      expect(harness.transaction).toHaveBeenCalledTimes(1);
      expect(harness.identity.mock.invocationCallOrder[0]).toBeLessThan(harness.writes.mock.invocationCallOrder[0]);
      expect(harness.disconnect).toHaveBeenCalledTimes(1);
    });

    it('bloqueia contexto global nao validado e contexto transacional expirado', async () => {
      vi.stubEnv('APP_ENV', 'test');
      vi.stubEnv('DATABASE_URL', 'postgresql://localhost/centraldeanimetest');
      vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://localhost/centraldeanimetest');
      const global = createSeedContext();
      const password = 'a'.repeat(96);
      const url = `postgresql://centraldeanime_validation:${password}@127.0.0.1:55432/centraldeanime_import_validation_20261112`;
      vi.stubEnv('APP_ENV', 'validation');
      vi.stubEnv('DATABASE_URL', url);
      vi.stubEnv('DATABASE_URL_UNPOOLED', url);
      await expect(personagens(global)).rejects.toMatchObject({ report: { estado: 'falhou' } });
      let captured: SeedContext | undefined;
      await withValidatedImport(async context => {
        expect(Object.isFrozen(context)).toBe(true);
        captured = context;
      });
      expect(captured).toBeDefined();
      await expect(personagens(captured)).rejects.toMatchObject({ report: { estado: 'falhou' } });
      expect(harness.writes).not.toHaveBeenCalled();
    });

    it('nao reutiliza contexto se a operacao mudar durante a transacao', async () => {
      await expect(withValidatedImport(async context => {
        vi.stubEnv('VALIDATION_OPERATION', 'replay');
        await personagens(context);
      })).rejects.toThrow();
      expect(harness.writes).not.toHaveBeenCalled();
    });
  });
});
