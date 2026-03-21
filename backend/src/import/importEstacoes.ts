import 'dotenv/config';
import estacoesData from '../../data/entidades/estacoes.json';
import { prisma, PrismaClient } from '../lib/prisma';

export async function importEstacoes(prismaProd: PrismaClient) {
  await prismaProd.estacao.deleteMany();

  for (const estacao of estacoesData) {
    await prismaProd.estacao.create({
      data: estacao,
    });
  }
  console.log('Importação concluída!');
}

importEstacoes(prisma);