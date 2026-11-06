import { z } from 'zod';
import { assertUnique, readRows } from '../utils/arquivos';
import { isDirectExecution } from '../utils/caminhos';
import { newReport, safeError, SeedFailure, type SeedReport } from '../utils/relatorio';
import { assertReferences } from './referencias';
import * as schemas from './schemas';
import { normalizeImage } from '../utils/imagens';

export async function validateInputs(): Promise<SeedReport> {
  const report = newReport('Entrada');
  const read = async <S extends z.ZodType>(file: string, schema: S) => {
    const fileReport = newReport(file);
    try {
      return await readRows(file, schema, fileReport);
    } finally {
      report.lidos += fileReport.lidos;
      report.validos += fileReport.validos;
    }
  };
  try {
    const status = await read('entidades/status.json', schemas.named);
    const generos = await read('entidades/generos.json', schemas.named);
    const estudios = await read('entidades/estudios.json', schemas.estudio);
    const plataformas = await read('entidades/plataformas.json', schemas.named);
    const tags = await read('entidades/tags.json', schemas.named);
    const franquias = await read('entidades/franquia.json', schemas.franquia);
    const capas = await read('entidades/capa.json', schemas.capa);
    const animes = await read('entidades/animes.json', schemas.anime);
    const personagens = await read('entidades/personagens.json', schemas.personagem);
    const episodios = await read('entidades/episodios.json', schemas.episodio);
    const estacoes = await read('entidades/estacoes.json', schemas.named);
    for (const rows of [status, generos, estudios, plataformas, tags, franquias, capas, animes, personagens, episodios, estacoes]) {
      assertUnique<{ id: number }>(rows, row => row.id, 'Entrada.id');
    }
    for (const rows of [status, generos, estudios, plataformas, tags, franquias, estacoes]) {
      assertUnique(rows, row => row.nome, 'Entrada.nome');
    }
    assertUnique(capas, row => row.caminho, 'Capas.caminho');
    assertUnique(episodios, row => `${row.animeId}:${row.temporadaId}:${row.numero}`, 'Episodios.chave');
    assertReferences(animes.map(row => row.statusId), status, 'Animes.statusId');
    assertReferences(animes.map(row => row.estudioId), estudios, 'Animes.estudioId');
    assertReferences(animes.map(row => row.franquiaId), franquias, 'Animes.franquiaId');
    assertReferences(animes.map(row => row.estacaoId), estacoes, 'Animes.estacaoId');
    assertReferences(episodios.map(row => row.animeId), animes, 'Episodios.animeId');
    const directoryEntries = new Map<string, string[]>();
    for (const row of animes) normalizeImage(row.capaUrl, report, row.id, true, directoryEntries);
    for (const row of personagens) normalizeImage(row.imagem, report, row.id, false, directoryEntries);
    for (const row of episodios) normalizeImage(row.imagemUrl, report, row.id, false, directoryEntries);
    for (const row of capas) normalizeImage(row.caminho, report, row.id, false, directoryEntries);
    const generoPairs = await read('relacionamentos/anime_genero.json', schemas.animeGenero);
    const personagemPairs = await read('relacionamentos/anime_personagem.json', schemas.animePersonagem);
    const plataformaPairs = await read('relacionamentos/anime_plataforma.json', schemas.animePlataforma);
    const tagPairs = await read('relacionamentos/anime_tag.json', schemas.animeTag);
    const statusUpdates = await read('relacionamentos/anime_status.json', schemas.animeStatus);
    for (const rows of [generoPairs, personagemPairs, plataformaPairs, tagPairs, statusUpdates]) {
      assertReferences(rows.map(row => row.animeId), animes, 'Relacionamentos.animeId');
    }
    assertReferences(generoPairs.map(row => row.generoId), generos, 'AnimeGenero.generoId');
    assertReferences(personagemPairs.map(row => row.personagemId), personagens, 'AnimePersonagem.personagemId');
    assertReferences(plataformaPairs.map(row => row.plataformaId), plataformas, 'AnimePlataforma.plataformaId');
    assertReferences(tagPairs.map(row => row.tagId), tags, 'AnimeTag.tagId');
    assertReferences(statusUpdates.map(row => row.statusId), status, 'AnimeStatus.statusId');
    assertUnique(generoPairs, row => `${row.animeId}:${row.generoId}`, 'AnimeGenero');
    assertUnique(personagemPairs, row => `${row.animeId}:${row.personagemId}`, 'AnimePersonagem');
    assertUnique(plataformaPairs, row => `${row.animeId}:${row.plataformaId}`, 'AnimePlataforma');
    assertUnique(tagPairs, row => `${row.animeId}:${row.tagId}`, 'AnimeTag');
    assertUnique(statusUpdates, row => row.animeId, 'AnimeStatus');
    const animeMap = new Map(animes.map(row => [row.id, row]));
    for (const row of episodios) {
      if (row.temporadaId !== animeMap.get(row.animeId)?.temporada) {
        report.avisos.push(`Episodio id=${row.id}: divergencia de temporada preservada.`);
      }
    }
    for (const row of statusUpdates) {
      if (row.statusId !== animeMap.get(row.animeId)?.statusId) {
        report.avisos.push(`Anime id=${row.animeId}: conflito de status; fontes preservadas, atualizacao explicita.`);
      }
    }
    report.inalterados = report.validos;
    return report;
  } catch (error) {
    report.estado = 'falhou';
    report.erros.push(safeError(error));
    report.naoExecutados = report.lidos;
    throw new SeedFailure(report);
  }
}

export async function main(): Promise<SeedReport> {
  try {
    const report = await validateInputs();
    console.log(JSON.stringify(report));
    return report;
  } catch (error) {
    if (error instanceof SeedFailure) console.error(JSON.stringify(error.report));
    throw error;
  }
}

if (isDirectExecution(import.meta.url)) {
  void main().catch(() => { process.exitCode = 1; });
}
