import { Router, Request, Response } from 'express';

const WebhooksRouter = Router();

WebhooksRouter.post('/webhooks/engagement', (req: Request, res: Response) => {
  try {
    // webhook payload handled
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ message: 'Erro ao processar webhook' });
  }
});

export default WebhooksRouter;
