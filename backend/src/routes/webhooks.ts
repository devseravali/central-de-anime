import { Router, Request, Response } from 'express';

const WebhooksRouter = Router();

/**
 * @swagger
 * /webhooks/engagement:
 *   post:
 *     summary: Recebe webhook de engagement
 *     description: Endpoint destinado ao recebimento de eventos de engagement por webhook.
 *     tags:
 *       - Webhooks
 *     responses:
 *       204:
 *         description: Webhook processado com sucesso
 *       500:
 *         description: Erro interno ao processar o webhook
 */
WebhooksRouter.post(
    '/webhooks/engagement',
    (req: Request, res: Response) => {
        try {
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            res.status(500).json({
                message: 'Erro ao processar webhook',
            });
        }
    }
);

export default WebhooksRouter;
