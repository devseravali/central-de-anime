import { Router, Request, Response } from 'express';

import { sendMail } from '../config/mailer';

const InfraRouter = Router();

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
 *     description: Retorna a especificação OpenAPI atualmente disponibilizada pelo endpoint de documentação.
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
    res.status(200).json({
      info: {
        title: 'API',
        version: '0.0.1',
      },
      paths: {},
    });
  }
);

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Exibe a página de documentação da API
 *     description: Retorna uma página HTML simples com informações sobre a documentação OpenAPI.
 *     tags:
 *       - Infraestrutura
 *     responses:
 *       200:
 *         description: Página de documentação retornada com sucesso
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: <html><body><h1>API Docs</h1><p>OpenAPI JSON available at /docs/openapi.json</p></body></html>
 *       500:
 *         description: Erro interno do servidor
 */
InfraRouter.get(
  '/docs',
  (_req: Request, res: Response) => {
    res
      .status(200)
      .send(
        '<html><body><h1>API Docs</h1><p>OpenAPI JSON available at /docs/openapi.json</p></body></html>'
      );
  }
);

/**
 * @swagger
 * /test-email:
 *   post:
 *     summary: Envia um email de teste
 *     description: >
 *       Envia um email de teste utilizando o serviço de email configurado na aplicação.
 *       O endereço de destino pode ser informado no body da requisição ou como parâmetro
 *       de query.
 *     tags:
 *       - Infraestrutura
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Endereço de email que receberá a mensagem de teste
 *                 example: teste@example.com
 *     parameters:
 *       - in: query
 *         name: to
 *         required: false
 *         description: Endereço de email que receberá a mensagem de teste
 *         schema:
 *           type: string
 *           format: email
 *           example: teste@example.com
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 info:
 *                   type: object
 *                   description: Informações retornadas pelo serviço de email
 *       400:
 *         description: Endereço de destino não informado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Campo "to" é obrigatório (body ou query)'
 *       500:
 *         description: Falha na configuração ou no envio do email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Falha ao enviar email
 */
InfraRouter.post(
  '/test-email',
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
 *     summary: Envia um email de teste via GET
 *     description: Envia um email de teste utilizando o endereço informado no parâmetro de query.
 *     tags:
 *       - Infraestrutura
 *     parameters:
 *       - in: query
 *         name: to
 *         required: true
 *         description: Endereço de email que receberá a mensagem de teste
 *         schema:
 *           type: string
 *           format: email
 *           example: teste@example.com
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 info:
 *                   type: object
 *                   description: Informações retornadas pelo serviço de email
 *       400:
 *         description: Parâmetro de email não informado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Parâmetro "to" é obrigatório na query, ex: /test-email?to=seu@email.com'
 *       500:
 *         description: Falha na configuração ou no envio do email
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Falha ao enviar email
 */
InfraRouter.get(
  '/test-email',
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