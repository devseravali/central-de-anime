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
  console.log(`anime_tag.json: ${items.length} itens lidos`);
  if (items.length === 0) return;

  const validItems = items.filter((r) => Number.isInteger(r?.animeId) && Number.isInteger(r?.tagId));
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) console.warn(`anime_tag: ${invalidCount} itens inválidos ignorados.`);

  const animeIds = Array.from(new Set(validItems.map((i) => i.animeId)));
  const existingAnimes = await prisma.anime.findMany({ where: { id: { in: animeIds } }, select: { id: true } });
  const animeSet = new Set(existingAnimes.map((a) => a.id));
  const missingAnime = validItems.map((r) => r.animeId).filter((id) => !animeSet.has(id));
  if (missingAnime.length > 0) console.warn('anime_tag: animes faltando:', Array.from(new Set(missingAnime)).slice(0, 20));

  const filtered = validItems.filter((r) => animeSet.has(r.animeId));
  if (filtered.length === 0) {
    console.log('anime_tag: nenhum relacionamento válido encontrado (faltam animes).');
    return;
  }

  await prisma.animeTagAnime.createMany({ data: filtered, skipDuplicates: true });
  console.log(`anime_tag: ${filtered.length} relacionamentos importados (${items.length} totais, ${items.length - filtered.length} ignorados).`);
}

async function importAnimePersonagens(): Promise<void> {
  const items = await readJson<{ animeId: number; personagemId: number }>('anime_personagem.json');
  console.log(`anime_personagem.json: ${items.length} itens lidos`);
  if (items.length === 0) return;

  const validItems = items.filter((r) => Number.isInteger(r?.animeId) && Number.isInteger(r?.personagemId));
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) console.warn(`anime_personagem: ${invalidCount} itens inválidos ignorados.`);

  const personagemIds = Array.from(new Set(validItems.map((i) => i.personagemId)));
  const animeIds = Array.from(new Set(validItems.map((i) => i.animeId)));
  const existingPersonagens = await prisma.personagem.findMany({ where: { id: { in: personagemIds } }, select: { id: true } });
  const existingAnimes = await prisma.anime.findMany({ where: { id: { in: animeIds } }, select: { id: true } });
  const personagemSet = new Set(existingPersonagens.map((p) => p.id));
  const animeSet = new Set(existingAnimes.map((a) => a.id));
  const missingPersonagens = validItems.map((r) => r.personagemId).filter((id) => !personagemSet.has(id));
  const missingAnimes = validItems.map((r) => r.animeId).filter((id) => !animeSet.has(id));
  if (missingPersonagens.length > 0) console.warn('anime_personagem: personagens faltando:', Array.from(new Set(missingPersonagens)).slice(0, 20));
  if (missingAnimes.length > 0) console.warn('anime_personagem: animes faltando:', Array.from(new Set(missingAnimes)).slice(0, 20));

  const filtered = validItems.filter((r) => personagemSet.has(r.personagemId) && animeSet.has(r.animeId));
  if (filtered.length === 0) {
    console.log('anime_personagem: nenhum relacionamento válido encontrado (faltam personagens ou animes).');
    return;
  }
  await prisma.animePersonagem.createMany({ data: filtered, skipDuplicates: true });
  console.log(`anime_personagem: ${filtered.length} relacionamentos importados (${items.length} totais, ${items.length - filtered.length} ignorados).`);
}

async function importAnimeGeneros(): Promise<void> {
  const items = await readJson<{ animeId: number; generoId: number }>('anime_genero.json');
  console.log(`anime_genero.json: ${items.length} itens lidos`);
  if (items.length === 0) return;

  const validItems = items.filter((r) => Number.isInteger(r?.animeId) && Number.isInteger(r?.generoId));
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) console.warn(`anime_genero: ${invalidCount} itens inválidos ignorados.`);

  const animeIds = Array.from(new Set(validItems.map((i) => i.animeId)));
  const generoIds = Array.from(new Set(validItems.map((i) => i.generoId)));
  const existingAnimes = await prisma.anime.findMany({ where: { id: { in: animeIds } }, select: { id: true } });
  const existingGeneros = await prisma.genero.findMany({ where: { id: { in: generoIds } }, select: { id: true } });
  const animeSet = new Set(existingAnimes.map((a) => a.id));
  const generoSet = new Set(existingGeneros.map((g) => g.id));
  const missingAnimes = animeIds.filter((id) => !animeSet.has(id));
  const missingGeneros = generoIds.filter((id) => !generoSet.has(id));
  if (missingAnimes.length > 0) console.warn('anime_genero: animes faltando:', missingAnimes.slice(0, 20));
  if (missingGeneros.length > 0) console.warn('anime_genero: generos faltando:', missingGeneros.slice(0, 20));

  const data = validItems.filter((r) => animeSet.has(r.animeId) && generoSet.has(r.generoId)).map((r) => ({ animeId: r.animeId, generoId: r.generoId }));
  if (data.length === 0) {
    console.log('anime_genero: nenhum relacionamento válido encontrado (faltam animes ou generos).');
    return;
  }
  await prisma.animeGenero.createMany({ data, skipDuplicates: true });
  console.log(`anime_genero: ${data.length} relacionamentos importados (${items.length} totais, ${items.length - data.length} ignorados).`);
}

async function importAnimePlataformas(): Promise<void> {
  const items = await readJson<{ animeId: number; plataformaId: number }>('anime_plataforma.json');
  console.log(`anime_plataforma.json: ${items.length} itens lidos`);
  if (items.length === 0) return;
  const validItems = items.filter((r) => Number.isInteger(r?.animeId) && Number.isInteger(r?.plataformaId));
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) console.warn(`anime_plataforma: ${invalidCount} itens inválidos ignorados.`);

  const plataformaIds = Array.from(new Set(validItems.map((i) => i.plataformaId)));
  const animeIds = Array.from(new Set(validItems.map((i) => i.animeId)));
  const existingPlataformas = await prisma.plataforma.findMany({ where: { id: { in: plataformaIds } }, select: { id: true } });
  const existingAnimes = await prisma.anime.findMany({ where: { id: { in: animeIds } }, select: { id: true } });
  const plataformaSet = new Set(existingPlataformas.map((p) => p.id));
  const animeSet = new Set(existingAnimes.map((a) => a.id));
  const missingPlataformas = validItems.map((r) => r.plataformaId).filter((id) => !plataformaSet.has(id));
  const missingAnimes = validItems.map((r) => r.animeId).filter((id) => !animeSet.has(id));
  if (missingPlataformas.length > 0) console.warn('anime_plataforma: plataformas faltando:', Array.from(new Set(missingPlataformas)).slice(0, 20));
  if (missingAnimes.length > 0) console.warn('anime_plataforma: animes faltando:', Array.from(new Set(missingAnimes)).slice(0, 20));

  const filtered = validItems.filter((r) => plataformaSet.has(r.plataformaId) && animeSet.has(r.animeId));
  if (filtered.length === 0) {
    console.log('anime_plataforma: nenhum relacionamento válido encontrado (faltam animes ou plataformas).');
    return;
  }
  await prisma.animePlataforma.createMany({ data: filtered.map((r) => ({ animeId: r.animeId, plataformaId: r.plataformaId })), skipDuplicates: true });
  console.log(`anime_plataforma: ${filtered.length} relacionamentos importados (${items.length} totais, ${items.length - filtered.length} ignorados).`);
}

async function importAnimeStatus(): Promise<void> {
  const items = await readJson<{ animeId: number; statusId: number }>('anime_status.json');
  if (items.length === 0) return;

  const validItems = items.filter((r) => Number.isInteger(r?.animeId) && Number.isInteger(r?.statusId));
  const invalidCount = items.length - validItems.length;
  if (invalidCount > 0) console.warn(`anime_status: ${invalidCount} itens inválidos ignorados.`);

  const ops = validItems.map((r) =>
    prisma.anime.update({ where: { id: r.animeId }, data: { statusId: r.statusId } }).catch((e) => {
      console.error(`Falha ao atualizar status para animeId=${r.animeId}:`, e.message ?? e);
    })
  );
  await Promise.all(ops);
  console.log(`anime_status: ${validItems.length} status aplicados.`);
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
if (process.argv[1] && (process.argv[1].endsWith('Relacionamentos.ts') || process.argv[1].endsWith('Relacionamentos.js'))) {
  const target = (process.argv[2] ?? 'all').toLowerCase();

  const run = async (): Promise<void> => {
    switch (target) {
      case 'all':
        await importRelacionamentosFromJson();
        break;
      case 'tags':
        await importAnimeTags();
        break;
      case 'personagens':
        await importAnimePersonagens();
        break;
      case 'generos':
        await importAnimeGeneros();
        break;
      case 'plataformas':
        await importAnimePlataformas();
        break;
      case 'status':
        await importAnimeStatus();
        break;
      default:
        throw new Error(`Alvo inválido para Relacionamentos: ${target}`);
    }
  };

  run()
    .then(async () => {
      console.log('Seed relacionamentos finalizado.');
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('Seed relacionamentos falhou:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
