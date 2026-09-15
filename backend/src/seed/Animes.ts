import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { AnimeType } from '../types/AnimeType';

function normalizeCapaFilename(fileName: string): string {
  const directMap: Record<string, string> = {
    'kimetsu-no-yaiba-mugen-t2.jpg': 'kimestu-no-yaiba-t2.jpg',
    'kimetsu-no-yaiba-t4.jpg': 'kimestu-no-yaiba-t4.jpg',
    'kimetsu-no-yaiba-t5.jpg': 'kimestu-no-yaiba-t5.jpg',
    'kimetsu-no-yaiba-filme-1-akaza-sairai.jpg': 'kimestu-no-yaiba-filme-1-akaza-sairai.jpg',
    'jujutsu-kaisen-inventario-oculto.jpg': 'jujutsu-kaisen-kaigyoku-gyokusetsu.jpg',
    'jujutsu-kaisen-incidente-de-shibuya.jpg': 'jujutsu-kaisen-shibuya-x-shimetsu.jpg',
    'made-in-abyss-the-retsujitsu-no-ougonkyou.jpg': 'made-in-abyss-retsujitsu-no-ougonkyou.jpg',
  };

  const mapped = directMap[fileName];
  if (mapped) return mapped;

  const narutoMatch = fileName.match(/^naruto-shippuden(?:-t)?(\d+)\.jpg$/i);
  if (narutoMatch) return `naruto-shippuden-t${narutoMatch[1]}.jpg`;

  return fileName;
}

function resolveCapaUrl(capaUrl: string | undefined | null): string | null {
  if (!capaUrl) return null;
  if (/^https?:\/\//i.test(capaUrl)) return capaUrl;

  const cleanedPath = (capaUrl as string).replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
  const parts = cleanedPath.split('/');
  const originalFilename = parts[parts.length - 1];
  if (originalFilename) parts[parts.length - 1] = normalizeCapaFilename(originalFilename);
  const normalizedPath = parts.join('/');

  const apiBase = (process.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  return `${apiBase}/${normalizedPath}`;
}

async function importAnimeFromJson(filePath: string): Promise<void> {
  const absolutePath = path.resolve(filePath);
  try {
    const fileContent = await readFile(absolutePath, 'utf-8');
    const animeData = JSON.parse(fileContent) as AnimeType[];

    for (const anime of animeData) {
      try {
        const createData: Prisma.AnimeUncheckedCreateInput = {
          id: anime.id,
          titulo: anime.titulo,
          tipo: anime.tipo,
          temporada: anime.temporada,
          ano: anime.ano,
          sinopse: anime.sinopse,
          capaUrl: resolveCapaUrl(anime.capaUrl),
          quantidadeEpisodios: anime.quantidadeEpisodios,
          franquiaId: anime.franquiaId ?? null,
          estudioId: anime.estudioId,
          statusId: anime.statusId,
        };

        const updateData: Prisma.AnimeUncheckedUpdateInput = {
          titulo: anime.titulo,
          tipo: anime.tipo,
          temporada: anime.temporada,
          ano: anime.ano,
          sinopse: anime.sinopse,
          capaUrl: resolveCapaUrl(anime.capaUrl),
          quantidadeEpisodios: anime.quantidadeEpisodios,
          franquiaId: anime.franquiaId ?? null,
          estudioId: anime.estudioId,
          statusId: anime.statusId,
        };

        await prisma.anime.upsert({
          where: { id: anime.id },
          update: updateData,
          create: createData,
        });
      } catch (itemErr) {
        console.error(`Erro ao inserir/atualizar anime id=${anime.id} titulo=${anime.titulo}:`, itemErr);
      }
    }
    console.log(`Importação concluída: ${animeData.length} itens processados.`);
  } catch (err) {
    console.error('Erro ao importar anime:', err);
    throw err;
  }
}

export { importAnimeFromJson };