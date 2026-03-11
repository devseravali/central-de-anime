import { Router } from 'express';
import os from 'os';
import { prisma } from '../lib/prisma';

export const healthRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Monitoramento e disponibilidade da API
 *
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verifica saúde básica da API
 *     responses:
 *       200:
 *         description: API online
 *
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Verifica saúde detalhada da API e do banco
 *     responses:
 *       200:
 *         description: Informações detalhadas de saúde da aplicação
 */

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    sucesso: true,
    dados: {
      status: 'online',
      timestamp: new Date().toISOString(),
      versao: '1.0.0',
      ambiente: process.env.NODE_ENV || 'development',
    },
  });
});

healthRouter.get('/detailed', async (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'online';
  } catch {
    dbStatus = 'offline';
  }

  res.status(200).json({
    sucesso: true,
    dados: {
      status: 'online',
      timestamp: new Date().toISOString(),
      versao: '1.0.0',
      ambiente: process.env.NODE_ENV || 'development',
      uptime: {
        segundos: Math.floor(uptime),
        minutos: Math.floor(uptime / 60),
        horas: Math.floor(uptime / 3600),
      },
      memoria: {
        heapUsado: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        heapLimite: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      },
      banco: dbStatus,
      host: {
        hostname: os.hostname(),
        ip:
          Object.values(os.networkInterfaces())
            .flat()
            .find((i) => i && i.family === 'IPv4' && !i.internal)?.address ||
          'N/A',
      },
    },
  });
});