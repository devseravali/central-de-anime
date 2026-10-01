import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { EpisodioType } from '../types/EpisodioType';

async function importEpisodiosFromJson(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    try {
        const fileContent = await readFile(absolutePath, 'utf-8');
        const episodiosData = JSON.parse(fileContent) as EpisodioType[];

        for (const episodio of episodiosData) {
            try {
                const createData: Prisma.EpisodioUncheckedCreateInput = {
                    id: episodio.id,
                    numero: episodio.numero,
                    titulo: episodio.titulo,
                    temporada: episodio.temporada ?? 0,
                    animeId: episodio.animeId,
                    sinopse: episodio.sinopse ?? '',
                    imagemUrl: episodio.imagemUrl ?? null,
                    dataExibicao: episodio.dataExibicao ? new Date(episodio.dataExibicao) : null,
                };

                const updateData: Prisma.EpisodioUncheckedUpdateInput = {
                    numero: episodio.numero,
                    titulo: episodio.titulo,
                    temporada: episodio.temporada ?? 0,
                    animeId: episodio.animeId,
                    sinopse: episodio.sinopse ?? '',
                    imagemUrl: episodio.imagemUrl ?? null,
                    dataExibicao: episodio.dataExibicao ? new Date(episodio.dataExibicao) : null,
                };

                const animeExists = await prisma.anime.findUnique({ where: { id: episodio.animeId } });
                if (!animeExists) {
                    console.warn(`Episódio id=${episodio.id} ignorado: animeId=${episodio.animeId} não encontrado.`);
                    continue;
                }

                await prisma.episodio.upsert({
                    where: { id: episodio.id },
                    update: updateData,
                    create: createData,
                });
            } catch (itemErr) {
                console.error(`Erro ao inserir/atualizar episódio id=${episodio.id} titulo=${episodio.titulo}:`, itemErr);
            }
        }
        console.log(`Importação concluída: ${episodiosData.length} itens processados.`);
    } catch (err) {
        console.error('Erro ao importar episódios:', err);
        throw err;
    }
}

export { importEpisodiosFromJson };
if (process.argv[1] && process.argv[1].endsWith('Episodios.ts')) {
    const file = path.resolve(__dirname, '../../data/entidades/episodios.json');
    importEpisodiosFromJson(file)
        .then(async () => {
            console.log('Seed episodios finalizado.');
            const count = await prisma.episodio.count();
            console.log('Episodios na base:', count);
            await prisma.$disconnect();
        })
        .catch(async (e) => {
            console.error('Seed episodios falhou:', e);
            await prisma.$disconnect();
            process.exit(1);
        });
}