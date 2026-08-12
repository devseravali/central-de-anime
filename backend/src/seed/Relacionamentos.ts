import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';

const DATA_DIR = path.resolve(__dirname, '../../data/relacionamentos');

async function readJson<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, fileName);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

async function importAnimeTags(): Promise<void> {
  const items = await readJson<{ animeId: number; tagId: number }>('anime_tag.json');
  if (items.length === 0) return;
  await prisma.animeTagAnime.createMany({ data: items, skipDuplicates: true });
  console.log(`anime_tag: ${items.length} relacionamentos importados.`);
}

async function importAnimePersonagens(): Promise<void> {
  const items = await readJson<{ animeId: number; personagemId: number }>('anime_personagem.json');
  if (items.length === 0) return;

  const personagemIds = Array.from(new Set(items.map((i) => i.personagemId)));
  const animeIds = Array.from(new Set(items.map((i) => i.animeId)));
  const existingPersonagens = await prisma.personagem.findMany({ where: { id: { in: personagemIds } }, select: { id: true } });
  const existingAnimes = await prisma.anime.findMany({ where: { id: { in: animeIds } }, select: { id: true } });
  const personagemSet = new Set(existingPersonagens.map((p) => p.id));
  const animeSet = new Set(existingAnimes.map((a) => a.id));
  const filtered = items.filter((r) => personagemSet.has(r.personagemId) && animeSet.has(r.animeId));
  if (filtered.length === 0) {
    console.log('anime_personagem: nenhum relacionamento válido encontrado (faltam personagens ou animes).');
    return;
  }
  await prisma.animePersonagem.createMany({ data: filtered, skipDuplicates: true });
  console.log(`anime_personagem: ${filtered.length} relacionamentos importados (${items.length} totais, ${items.length - filtered.length} ignorados).`);
}

async function importAnimeGeneros(): Promise<void> {
  const items = await readJson<{ animeId: number; generoId: number }>('anime_genero.json');
  if (items.length === 0) return;

  const data = items.map((r) => ({ animeId: r.animeId, generoId: r.generoId }));
  await prisma.animeGenero.createMany({ data, skipDuplicates: true });
  console.log(`anime_genero: ${items.length} relacionamentos importados.`);
}

async function importAnimePlataformas(): Promise<void> {
  const items = await readJson<{ animeId: number; plataformaId: number }>('anime_plataforma.json');
  if (items.length === 0) return;
  const data = items.map((r) => ({ animeId: r.animeId, plataformaId: r.plataformaId }));
  await prisma.animePlataforma.createMany({ data, skipDuplicates: true });
  console.log(`anime_plataforma: ${items.length} relacionamentos importados.`);
}

async function importAnimeStatus(): Promise<void> {
  const items = await readJson<{ animeId: number; statusId: number }>('anime_status.json');
  if (items.length === 0) return;

  const ops = items.map((r) =>
    prisma.anime.update({ where: { id: r.animeId }, data: { statusId: r.statusId } }).catch((e) => {
      console.error(`Falha ao atualizar status para animeId=${r.animeId}:`, e.message ?? e);
    })
  );
  await Promise.all(ops);
  console.log(`anime_status: ${items.length} status aplicados.`);
}

async function importRelacionamentosFromJson(): Promise<void> {
  try {
    await importAnimeTags();
    await importAnimePersonagens();
    await importAnimeGeneros();
    await importAnimePlataformas();
    await importAnimeStatus();
    console.log('Importação de relacionamentos concluída.');
  } catch (err) {
    console.error('Erro ao importar relacionamentos:', err);
    throw err;
  }
}

export { importRelacionamentosFromJson };
