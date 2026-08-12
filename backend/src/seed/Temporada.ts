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

    const legacyGeneric = await prisma.temporada.findUnique({
      where: { id: 0 },
    });
    if (legacyGeneric && legacyGeneric.nome !== 'Filme') {
      await prisma.temporada.update({
        where: { id: 0 },
        data: { nome: 'Filme' },
      });
    }

    for (const temporada of temporadasData) {
      const existsByName = await prisma.temporada.findFirst({ where: { nome: temporada.nome } });
      const validId = typeof temporada.id === 'number' && temporada.id > 0;

      if (validId) {
        const where: Prisma.TemporadaWhereUniqueInput = { id: temporada.id };
        const createData: Prisma.TemporadaUncheckedCreateInput = { id: temporada.id, nome: temporada.nome };
        const updateData: Prisma.TemporadaUpdateInput = { nome: temporada.nome };

        await prisma.temporada.upsert({ where, update: updateData, create: createData });
      } else if (temporada.nome === 'Filme' && legacyGeneric) {
        continue;
      } else if (!existsByName) {
        await prisma.$executeRaw`
          INSERT INTO "Temporada" ("nome") VALUES (${temporada.nome}) ON CONFLICT ("nome") DO NOTHING
        `;
      }
    }

    console.log(`Importação concluída: ${temporadasData.length} temporadas processadas.`);
  } catch (err) {
    console.error('Erro ao importar temporadas:', err);
    throw err;
  }
}

export { importTemporadasFromJson };
