import 'dotenv/config';
import GenerosData from '../../data/entidades/generos.json';
import { prisma, PrismaClient } from '../lib/prisma';

export async function importGeneros(prismaProd: PrismaClient) {
  await prismaProd.genero.deleteMany({});
  for (const genero of GenerosData) {
    try {
      await prismaProd.genero.create({
        data: {
          id: genero.id,
          nome: genero.nome,
        },
      });
    } catch (error) {
      console.error(
        `Erro ao importar gênero: ${genero.nome || JSON.stringify(genero)}`,
      );
      console.error(error);
    }
  }
  console.log('Importação de gêneros concluída!');
}

importGeneros(prisma);