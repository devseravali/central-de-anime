import path from 'node:path';
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { prisma } from '../config/prisma';
import { importAuxiliariesFromJson } from './Auxiliaries';
import { importAnimeFromJson } from './Animes';
import { importPersonagensFromJson } from './Personagens';
import { importEpisodiosFromJson } from './Episodios';
import { importRelacionamentosFromJson } from './Relacionamentos';
import { importTemporadasFromJson } from './Temporada';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const dataDir = path.resolve(__dirname, '../../data/entidades');

  try {
    console.log('Seed: iniciando importação de dados auxiliares...');
    await importAuxiliariesFromJson();

    const animesPath = path.join(dataDir, 'animes.json');
    if (await fileExists(animesPath)) {
      console.log('Seed: importando animes...');
      await importAnimeFromJson(animesPath);
    } else {
      console.warn('Seed: animes.json não encontrado — pulando importação de animes.');
    }

    const temporadasPath = path.join(dataDir, 'temporada.json');
    if (await fileExists(temporadasPath)) {
      console.log('Seed: importando temporadas...');
      await importTemporadasFromJson(temporadasPath);
    } else {
      console.warn('Seed: temporada.json não encontrado — pulando.');
    }

    const personagensPath = path.join(dataDir, 'personagens.json');
    if (await fileExists(personagensPath)) {
      console.log('Seed: importando personagens...');
      await importPersonagensFromJson(personagensPath);
    } else {
      console.warn('Seed: personagens.json não encontrado — pulando.');
    }
    const relacionamentosDir = path.join(path.resolve(__dirname, '../../data'), 'relacionamentos');
    const animeTagPath = path.join(relacionamentosDir, 'anime_tag.json');
    if (await fileExists(animeTagPath)) {
      console.log('Seed: importando relacionamentos...');
      await importRelacionamentosFromJson();
    } else {
      console.warn('Seed: relacionamentos não encontrado — pulando.');
    }
    const episodiosPath = path.join(dataDir, 'episodios.json');
    if (await fileExists(episodiosPath)) {
      console.log('Seed: importando episódios...');
      await importEpisodiosFromJson(episodiosPath);
    } else {
      console.warn('Seed: episodios.json não encontrado — pulando.');
    }

    console.log('Seed: execução concluída com sucesso.');
  } catch (err) {
    console.error('Seed: erro não tratado durante execução:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

const invokedDirectly = Boolean(
  process.argv[1] && (process.argv[1].includes('src/seed/index.ts') || process.argv[1].includes('src\\seed\\index.ts'))
);

if (invokedDirectly) {
  main().catch((e) => {
    console.error('Seed: falha ao executar o seed:', e);
    process.exit(1);
  });
}

export { main };
