import { Router, Request, Response } from 'express';

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

export default InfraRouter;
