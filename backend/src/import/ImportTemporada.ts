import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { TemporadaType } from '../types/TemporadaType';

async function importTemporadaFromJson(filePath: string): Promise<void> { 
    const absolutePath = path.resolve(filePath);
    try {
        const fileContent = await readFile(absolutePath, 'utf-8');
        const temporadaData = JSON.parse(fileContent) as TemporadaType[];
        for (const temporada of temporadaData) {
            try {
                await prisma.temporada.upsert({  
                    where: { id: temporada.id },
                    update: {
                        id: temporada.id,
                        numero: temporada.numero,
                        ano: temporada.ano,
                        animeId: temporada.animeId,
                    },
                    create: {
                        id: temporada.id,
                        numero: temporada.numero,
                        ano: temporada.ano,
                        animeId: temporada.animeId,
                    },
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