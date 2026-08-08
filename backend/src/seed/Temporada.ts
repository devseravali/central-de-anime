import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { TemporadaType } from '../types/TemporadaType';

async function importTemporadaFromJson(filePath: string): Promise<void> { 
    const absolutePath = path.resolve(filePath);
    try {
        const fileContent = await readFile(absolutePath, 'utf-8');
        const temporadaData = JSON.parse(fileContent) as TemporadaType[];
        for (const temporada of temporadaData) {
                try {
                    const data: Prisma.TemporadaUncheckedCreateInput = {
                        id: temporada.id,
                        numero: temporada.numero,
                        ano: temporada.ano ?? null,
                        animeId: temporada.animeId,
                    };

                    await prisma.temporada.upsert({
                        where: { id: temporada.id },
                        update: {
                            numero: temporada.numero,
                            ano: temporada.ano ?? null,
                            animeId: temporada.animeId,
                        },
                        create: data,
                    });
            } catch (error) {
                console.error(`Erro ao importar temporada ${temporada.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Erro ao importar arquivo de temporadas:', error);
    }
}

export { importTemporadaFromJson };