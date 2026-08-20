import { Router, Request, Response } from 'express';
import { sendMail } from '../config/mailer';

const InfraRouter = Router();

InfraRouter.get('/metrics', (_req: Request, res: Response) => {
	const memory = process.memoryUsage();
	res.status(200).json({
		uptime: process.uptime(),
		memory,
		env: process.env.NODE_ENV ?? 'development',
	});
});

InfraRouter.get('/docs/openapi.json', (_req: Request, res: Response) => {
	res.status(200).json({ info: { title: 'API', version: '0.0.1' }, paths: {} });
});

InfraRouter.get('/docs', (_req: Request, res: Response) => {
	res.status(200).send('<html><body><h1>API Docs</h1><p>OpenAPI JSON available at /docs/openapi.json</p></body></html>');
});

InfraRouter.post('/test-email', async (req: Request, res: Response) => {
	const to: string | undefined = req.body?.to || req.query?.to;
	if (!to) {
		return res.status(400).json({ error: 'Campo "to" é obrigatório (body ou query)' });
	}

	const mailFrom = process.env.MAIL_FROM;
	if (!mailFrom) {
		return res.status(500).json({ error: 'MAIL_FROM não configurado no .env' });
	}

	try {
		const info = await sendMail({
			from: mailFrom,
			to,
			subject: 'Teste de envio - Central de Anime',
			text: 'Este é um email de teste enviado pela API.',
			html: '<p>Este é um email de teste enviado pela API.</p>',
		});

		return res.status(200).json({ ok: true, info });
	} catch (err) {
		console.error('Erro no endpoint /infra/test-email:', err);
		return res.status(500).json({ error: 'Falha ao enviar email', details: String(err) });
	}
});

InfraRouter.get('/test-email', async (req: Request, res: Response) => {
	const to: string | undefined = req.query?.to as string | undefined;
	if (!to) {
		return res.status(400).send('Parâmetro "to" é obrigatório na query, ex: /test-email?to=seu@email.com');
	}

	const mailFrom = process.env.MAIL_FROM;
	if (!mailFrom) {
		return res.status(500).send('MAIL_FROM não configurado no .env');
	}

	try {
		const info = await sendMail({
			from: mailFrom,
			to,
			subject: 'Teste de envio - Central de Anime',
			text: 'Este é um email de teste enviado pela API (GET).',
			html: '<p>Este é um email de teste enviado pela API (GET).</p>',
		});

		return res.status(200).json({ ok: true, info });
	} catch (err) {
		console.error('Erro no endpoint GET /test-email:', err);
		return res.status(500).send('Falha ao enviar email: ' + String(err));
	}
});

export default InfraRouter;

