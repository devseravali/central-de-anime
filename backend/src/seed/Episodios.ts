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
                    temporadaId: episodio.temporadaId,
                    animeId: episodio.animeId,
                    sinopse: episodio.sinopse ?? '',
                    imagemUrl: episodio.imagemUrl ?? null,
                    dataExibicao: episodio.dataExibicao ? new Date(episodio.dataExibicao) : null,
                };

                const updateData: Prisma.EpisodioUpdateInput = {
                    numero: episodio.numero,
                    titulo: episodio.titulo,
                    temporadaId: episodio.temporadaId,
                    animeId: episodio.animeId,
                    sinopse: episodio.sinopse ?? '',
                    imagemUrl: episodio.imagemUrl ?? null,
                    dataExibicao: episodio.dataExibicao ? new Date(episodio.dataExibicao) : null,
                };

                await prisma.episodio.upsert({
                    where: { id: episodio.id },
                    update: updateData,
                    create: createData,
                });
            } catch (itemErr) {
                console.error(`Erro ao inserir/atualizar episódio id=${episodio.id} titulo=${episodio.titulo}:`, itemErr);
                console.error(`Erro ao processar episódio id=${episodio.id} titulo=${episodio.titulo}:`, itemErr);
            }
        }
        console.log(`Importação concluída: ${episodiosData.length} itens processados.`);
    } catch (err) {
        console.error('Erro ao importar episódios:', err);
        throw err;
    }
}

export { importEpisodiosFromJson };