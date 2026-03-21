import 'dotenv/config';
import estudiosData from '../../data/entidades/estudios.json';
import { prisma, PrismaClient } from '../lib/prisma';

export async function importEstudios(prismaProd: PrismaClient) {
  await prismaProd.estudio.deleteMany();

  let count = 0;
  for (const estudio of estudiosData) {
    const principaisObras = Array.isArray(estudio.principaisObras)
      ? estudio.principaisObras.join(', ')
      : estudio.principaisObras;
    await prismaProd.estudio.create({
      data: {
        id: estudio.id,
        nome: estudio.nome,
        principaisObras,
      },
    });
    count++;
  }
  console.log(`Importação de estudios concluída! Total inseridos: ${count}`);
}

importEstudios(prisma);