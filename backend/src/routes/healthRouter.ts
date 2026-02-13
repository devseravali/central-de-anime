import { Router } from 'express';

const healthRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verifica o status da API
 *     responses:
 *       200:
 *         description: API online
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

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Verifica o status detalhado da API
 *     responses:
 *       200:
 *         description: API online com detalhes de uptime e memória
 */
healthRouter.get('/detailed', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

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
    },
  });
});

export { healthRouter };
