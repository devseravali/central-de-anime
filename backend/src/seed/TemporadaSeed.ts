import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { TemporadaType } from '../types/TemporadaType';

async function importTemporadasFromJson(filePath: string): Promise<void> {
  const absolutePath = path.resolve(filePath);
  try {
    const fileContent = await readFile(absolutePath, 'utf-8');
    const temporadasData = JSON.parse(fileContent) as TemporadaType[];

    for (const temporada of temporadasData) {
      const data: Prisma.TemporadaUncheckedCreateInput = {
        id: temporada.id,
        nome: temporada.nome,
      };

      await prisma.temporada.upsert({
        where: { id: temporada.id },
        update: data,
        create: data,
      });
    }

    console.log(`Importação concluída: ${temporadasData.length} temporadas processadas.`);
  } catch (err) {
    console.error('Erro ao importar temporadas:', err);
    throw err;
  }
}

export { importTemporadasFromJson };
