import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../src/config/prisma';

type TemporadaSeedItem = {
  id?: number;
  nome: string;
};

async function main() {
  try {
    const filePath = path.resolve(process.cwd(), 'data/entidades/temporada.json');
    const raw = await readFile(filePath, 'utf-8');
    const itens = JSON.parse(raw) as TemporadaSeedItem[];

    let processed = 0;

    for (const item of itens) {
      const nome = item.nome.trim();
      if (!nome) continue;

      if (typeof item.id === 'number' && item.id > 0) {
        const existing = await prisma.temporada.findUnique({ where: { id: item.id } });
        if (existing) {
          await prisma.temporada.update({
            where: { id: item.id },
            data: { nome },
          });
        } else {
          await prisma.temporada.create({
            data: { id: item.id, nome },
          });
        }
      } else {
        const existing = await prisma.temporada.findFirst({ where: { nome } });
        if (existing) {
          await prisma.temporada.update({
            where: { id: existing.id },
            data: { nome },
          });
        } else {
          await prisma.temporada.create({ data: { nome } });
        }
      }

      processed += 1;
    }

    const total = await prisma.temporada.count();
    console.log('Temporadas processadas:', processed);
    console.log('Total final de temporadas:', total);
  } catch (err) {
    console.error('Erro ao normalizar temporadas sem apagar episódios:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
