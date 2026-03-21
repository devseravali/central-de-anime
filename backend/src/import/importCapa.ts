import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import capaData from '../../data/entidades/capa.json';
import { PrismaPg } from '@prisma/adapter-pg';
import { Capa } from '../types/capa';
import fs from 'fs';
import path from 'path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const capas: Capa[] = Array.isArray(capaData) ? (capaData as Capa[]) : [];

async function verificarConexao() {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  }
}

export async function importCapa() {
  try {
    await verificarConexao();

    console.log(`Iniciando importação de ${capas.length} capas...`);

    const arquivosAusentes: string[] = [];

    await prisma.capas.createMany({
      data: capas.map((capa) => {
        const filePath = path.join(
          __dirname,
          '../../data/entidades',
          capa.caminho,
        );
        let tamanho = 0;

        if (fs.existsSync(filePath)) {
          try {
            const stats = fs.statSync(filePath);
            tamanho = stats.size;
          } catch (error) {
            console.error(
              `Erro ao obter o tamanho do arquivo ${filePath}:`,
              error,
            );
          }
        } else {
          console.warn(`Arquivo ausente: ${filePath}`);
          arquivosAusentes.push(filePath);
        }

        return {
          nome_original: capa.nome_original,
          nome_salvo: capa.nome_salvo,
          caminho: capa.caminho,
          mime_type: capa.mimetype,
        };
      }),
      skipDuplicates: true,
    });

    if (arquivosAusentes.length > 0) {
      const logDir = path.join(__dirname, '../../logs');
      const logPath = path.join(logDir, 'arquivos_ausentes.log');

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.writeFileSync(logPath, arquivosAusentes.join('\n'));
      console.log(`Log de arquivos ausentes salvo em: ${logPath}`);
    }

    console.log('Importação concluída com sucesso.');
  } catch (error) {
    console.error('Erro durante a importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCapa();
