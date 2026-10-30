import { Router, Request, Response } from 'express';

import { sendMail } from '../config/mailer';
import { swaggerSpec } from '../config/swagger';

const InfraRouter = Router();

function disableTestEmailInProduction(
  _req: Request,
  res: Response,
  next: () => void
): void {
  if (process.env.NODE_ENV === 'production') {
    res.sendStatus(404);
    return;
  }

  next();
}

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Retorna métricas da aplicação
 *     description: Retorna informações de uptime, uso de memória e ambiente de execução da API.
 *     tags:
 *       - Infraestrutura
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Tempo de execução da aplicação em segundos
 *                   example: 3600.52
 *                 memory:
 *                   type: object
 *                   description: Informações de uso de memória do processo Node.js
 *                   properties:
 *                     rss:
 *                       type: integer
 *                       description: Resident Set Size em bytes
 *                       example: 52428800
 *                     heapTotal:
 *                       type: integer
 *                       description: Memória total do heap em bytes
 *                       example: 10485760
 *                     heapUsed:
 *                       type: integer
 *                       description: Memória utilizada do heap em bytes
 *                       example: 7340032
 *                     external:
 *                       type: integer
 *                       description: Memória utilizada por recursos externos em bytes
 *                       example: 1048576
 *                     arrayBuffers:
 *                       type: integer
 *                       description: Memória utilizada por ArrayBuffers em bytes
 *                       example: 524288
 *                 env:
 *                   type: string
 *                   description: Ambiente de execução da aplicação
 *                   example: development
 *       500:
 *         description: Erro interno do servidor
 */
InfraRouter.get(
  '/metrics',
  (_req: Request, res: Response) => {
    const memory = process.memoryUsage();

    res.status(200).json({
      uptime: process.uptime(),
      memory,
      env: process.env.NODE_ENV ?? 'development',
    });
  }
);

/**
 * @swagger
 * /docs/openapi.json:
 *   get:
 *     summary: Retorna a especificação OpenAPI
 *     description: Retorna a mesma especificação OpenAPI usada pelo Swagger UI.
 *     tags:
 *       - Infraestrutura
 *     responses:
 *       200:
 *         description: Especificação OpenAPI retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: API
 *                     version:
 *                       type: string
 *                       example: 0.0.1
 *                 paths:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Erro interno do servidor
 */
InfraRouter.get(
  '/docs/openapi.json',
  (_req: Request, res: Response) => {
    res.status(200).json(swaggerSpec);
  }
);

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Redireciona para o Swagger UI
 *     description: Mantém compatibilidade e redireciona para /api-docs.
 *     tags:
 *       - Infraestrutura
 *     responses:
 *       302:
 *         description: Redirecionamento para /api-docs
 *       500:
 *         description: Erro interno do servidor
 */
InfraRouter.get(
  '/docs',
  (_req: Request, res: Response) => {
    res.redirect('/api-docs');
  }
);

/**
 * @swagger
 * /test-email:
 *   post:
 *     summary: Envia um email de teste
 *     description: >
 *       Disponível apenas em desenvolvimento e teste; retorna 404 em produção.
 *     tags:
 *       - Infraestrutura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *     parameters:
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Email de teste enviado
 *       400:
 *         description: Destinatário ausente
 *       500:
 *         description: Falha no envio ou configuração do email
 *       404:
 *         description: Endpoint desabilitado em produção
 */
InfraRouter.post(
  '/test-email',
  disableTestEmailInProduction,
  async (req: Request, res: Response) => {
    const to: string | undefined =
      req.body?.to || req.query?.to;

    if (!to) {
      return res.status(400).json({
        error: 'Campo "to" é obrigatório (body ou query)',
      });
    }

    const mailFrom = process.env.MAIL_FROM;

    if (!mailFrom) {
      return res.status(500).json({
        error: 'MAIL_FROM não configurado no .env',
      });
    }

    try {
      const info = await sendMail({
        from: mailFrom,
        to,
        subject: 'Teste de envio - Central de Anime',
        text: 'Este é um email de teste enviado pela API.',
        html: '<p>Este é um email de teste enviado pela API.</p>',
      });

      return res.status(200).json({
        ok: true,
        info,
      });
    } catch (err) {
      console.error(
        'Erro no endpoint /infra/test-email:',
        err
      );

      return res.status(500).json({
        error: 'Falha ao enviar email',
      });
    }
  }
);

/**
 * @swagger
 * /test-email:
 *   get:
 *     summary: Envia um email de teste
 *     description: >
 *       Disponível apenas em desenvolvimento e teste; retorna 404 em produção.
 *     tags:
 *       - Infraestrutura
 *     parameters:
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Email de teste enviado
 *       400:
 *         description: Destinatário ausente
 *       500:
 *         description: Falha no envio ou configuração do email
 *       404:
 *         description: Endpoint desabilitado em produção
 */
InfraRouter.get(
  '/test-email',
  disableTestEmailInProduction,
  async (req: Request, res: Response) => {
    const to: string | undefined =
      req.query?.to as string | undefined;

    if (!to) {
      return res
        .status(400)
        .send(
          'Parâmetro "to" é obrigatório na query, ex: /test-email?to=seu@email.com'
        );
    }

    const mailFrom = process.env.MAIL_FROM;

    if (!mailFrom) {
      return res
        .status(500)
        .send('MAIL_FROM não configurado no .env');
    }

    try {
      const info = await sendMail({
        from: mailFrom,
        to,
        subject: 'Teste de envio - Central de Anime',
        text: 'Este é um email de teste enviado pela API (GET).',
        html: '<p>Este é um email de teste enviado pela API (GET).</p>',
      });

      return res.status(200).json({
        ok: true,
        info,
      });
    } catch (err) {
      console.error(
        'Erro no endpoint GET /test-email:',
        err
      );

      return res
        .status(500)
        .send('Falha ao enviar email');
    }
  }
);

export default InfraRouter;