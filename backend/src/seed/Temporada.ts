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
      const validId = typeof temporada.id === 'number' && temporada.id > 0;

      if (validId) {
        const where = { id: temporada.id };
        const createData: Prisma.TemporadaUncheckedCreateInput = { id: temporada.id, nome: temporada.nome };
        const updateData: Prisma.TemporadaUpdateInput = { nome: temporada.nome } as any;

        await prisma.temporada.upsert({ where, update: updateData, create: createData });
      } else {
        const existing = await prisma.temporada.findFirst({ where: { nome: temporada.nome } });
        if (existing) {
          await prisma.temporada.update({ where: { id: existing.id }, data: { nome: temporada.nome } });
        } else {
          await prisma.temporada.create({ data: { nome: temporada.nome } });
        }
      }
    }

    console.log(`Importação concluída: ${temporadasData.length} temporadas processadas.`);
  } catch (err) {
    console.error('Erro ao importar temporadas:', err);
    throw err;
  }
}

export { importTemporadasFromJson };
