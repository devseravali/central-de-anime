import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { AnimeType } from '../types/AnimeType';

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
          capaUrl: anime.capaUrl ?? null,
          quantidadeEpisodios: anime.quantidadeEpisodios,
          franquiaId: anime.franquiaId ?? null,
          estudioId: anime.estudioId,
          statusId: anime.statusId,
          estacaoId: anime.estacaoId ?? null,
        };

        const updateData: Prisma.AnimeUpdateInput = {
          titulo: anime.titulo,
          tipo: anime.tipo,
          temporada: anime.temporada,
          ano: anime.ano,
          sinopse: anime.sinopse,
          capaUrl: anime.capaUrl ?? null,
          quantidadeEpisodios: anime.quantidadeEpisodios,
          franquiaId: anime.franquiaId ?? null,
          estudioId: anime.estudioId,
          statusId: anime.statusId,
          estacaoId: anime.estacaoId ?? null,
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