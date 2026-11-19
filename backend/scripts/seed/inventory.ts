import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { dataRoot } from '../../src/seed/utils/caminhos';
import { validateInputs } from '../../src/seed/validacoes/Entrada';
import { safeError } from '../../src/seed/utils/relatorio';

const consumers: Record<string, string> = {
  animes: 'entidades/Animes.ts', personagens: 'entidades/Personagens.ts', episodios: 'entidades/Episodios.ts',
  status: 'auxiliares/Status.ts', generos: 'auxiliares/Generos.ts', estudios: 'auxiliares/Estudios.ts',
  plataformas: 'auxiliares/Plataformas.ts', tags: 'auxiliares/Tags.ts', franquia: 'auxiliares/Franquias.ts',
  capa: 'auxiliares/Capas.ts', estacoes: 'auxiliares/Estacoes.ts',
  anime_genero: 'relacionamentos/AnimeGenero.ts', anime_personagem: 'relacionamentos/AnimePersonagem.ts',
  anime_plataforma: 'relacionamentos/AnimePlataforma.ts', anime_tag: 'relacionamentos/AnimeTag.ts',
  anime_status: 'atualizacoes/AnimeStatus.ts',
};
const references: Record<string, Record<string, string>> = {
  animes: { estudioId: 'estudios.id', statusId: 'status.id', franquiaId: 'franquia.id', estacaoId: 'estacoes.id' },
  episodios: { animeId: 'animes.id' },
  anime_genero: { animeId: 'animes.id', generoId: 'generos.id' },
  anime_personagem: { animeId: 'animes.id', personagemId: 'personagens.id' },
  anime_plataforma: { animeId: 'animes.id', plataformaId: 'plataformas.id' },
  anime_tag: { animeId: 'animes.id', tagId: 'tags.id' },
  anime_status: { animeId: 'animes.id', statusId: 'status.id' },
};
const optional: Record<string, readonly string[]> = {
  animes: ['capaUrl', 'franquiaId'],
  personagens: ['idade_inicial', 'sexo', 'papel', 'aniversario', 'altura_inicial', 'afiliacao'],
  episodios: ['imagemUrl', 'dataExibicao'],
  franquia: ['descricao', 'anoInicio'],
};

try {
  const validation = await validateInputs();
  const files = [];
  for (const directory of await readdir(dataRoot, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    for (const name of (await readdir(join(dataRoot, directory.name))).filter(name => name.endsWith('.json')).sort()) {
      const contents = await readFile(join(dataRoot, directory.name, name));
      const value: unknown = JSON.parse(contents.toString('utf8'));
      if (!Array.isArray(value)) throw new Error('Inventario exige arrays.');
      const rows: Record<string, unknown>[] = value.map(row => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Registro invalido.');
        return Object.fromEntries(Object.entries(row));
      });
      const fields = [...new Set(rows.flatMap(row => Object.keys(row)))];
      const ids = rows.flatMap(row => typeof row.id === 'number' ? [row.id] : []);
      const source = name.slice(0, -5);
      files.push({
        path: `data/${directory.name}/${name}`, records: rows.length,
        sha256: createHash('sha256').update(contents).digest('hex'),
        seed: `src/seed/${consumers[source] ?? 'NAO MAPEADO'}`,
        references: references[source] ?? {},
        referenceIntegrity: 'validada por validateInputs antes de gerar este inventario',
        requiredFields: fields.filter(field => !(optional[source] ?? []).includes(field)),
        optionalFields: optional[source] ?? [],
        compatibility: source === 'episodios' ? 'temporadaId mapeado para temporada sem alterar fonte' :
          source === 'personagens' ? 'nivelCombate preservado, inclusive inteiro textual validado' : undefined,
        ids: ids.length ? { count: ids.length, min: Math.min(...ids), max: Math.max(...ids), unique: new Set(ids).size } : 'chave composta',
        fields: fields.map(field => ({
          field, types: [...new Set(rows.filter(row => field in row).map(row => row[field] === null ? 'null' : typeof row[field]))],
          missing: rows.filter(row => !(field in row)).length, nulls: rows.filter(row => row[field] === null).length,
        })),
      });
    }
  }
  console.log(JSON.stringify({ source: 'JSONs atuais, sem fontes alternativas', files,
    validation: { records: validation.validos, warnings: validation.avisos, errors: validation.erros },
    requiredFields: 'src/seed/validacoes/schemas.ts; campos presentes nao implicam obrigatoriedade do schema',
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ result: 'falhou', message: safeError(error) }));
  process.exitCode = 1;
}
