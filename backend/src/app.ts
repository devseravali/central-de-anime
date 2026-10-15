import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import { errorMiddleware } from './middlewares/errorMiddleware';
import checkCriticalEnv from './config/envCheck';

import authRoutes from './routes/auth';
import usuarioRoutes from './routes/usuario';
import animesRoutes from './routes/animes';
import interacoesRoutes from './routes/interacoes';
import watchProgressRoutes from './routes/watchProgress';
import rankingRoutes from './routes/ranking';
import personagensRoutes from './routes/personagens';
import episodiosRoutes from './routes/episodios';
import sessionsRoutes from './routes/sessions';
import adminRoutes from './routes/admin';
import favoritosRoutes from './routes/favoritos';
import avaliacoesRoutes from './routes/avaliacoes';
import progressosRoutes from './routes/progressos';
import batchRoutes from './routes/batch';
import exportRoutes from './routes/export';
import infraRoutes from './routes/infra';
import webhooksRoutes from './routes/webhooks';
import estudiosRoutes from './routes/estudios';
import estacoesRoutes from './routes/estacoes';

checkCriticalEnv();

const app = express();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const imagesDir = path.resolve(currentDir, '..', 'images');
const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/g, '');

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: {
            policy: 'cross-origin',
        },
    })
);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    '/images',
    express.static(imagesDir)
);

app.use((req, _res, next) => {
    try {
        let normalized = req.url;

        normalized = normalized.replace(/\s+$/g, '');
        normalized = normalized.replace(/(?:%20)+$/gi, '');

        if (normalized !== req.url) {
            req.url = normalized;
        }
    } catch (_err) {
    }

    next();
});

app.use((req, _res, next) => next());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check da aplicação
 *     tags:
 *       - Infra
 *     responses:
 *       200:
 *         description: Aplicação saudável
 */
app.get('/health', (_request, response) => {
    response.json({
        status: 'ok',
    });
});

const redirectToFrontendRoute = (req: express.Request, res: express.Response) => {
    const host = req.get('host');
    const apiOrigin = host ? `${req.protocol}://${host}` : null;

    if (apiOrigin && frontendUrl === apiOrigin) {
        res.status(500).json({
            message: 'FRONTEND_URL aponta para a API. Configure FRONTEND_URL para o frontend.',
        });
        return;
    }

    res.redirect(302, `${frontendUrl}${req.originalUrl}`);
};

/**
 * @swagger
 * /reset-password:
 *   get:
 *     summary: Redireciona para a página de redefinição de senha no frontend
 *     tags:
 *       - Infra
 *     responses:
 *       302:
 *         description: Redirecionamento para o frontend
 */
app.get('/reset-password', redirectToFrontendRoute);

/**
 * @swagger
 * /confirmar-email:
 *   get:
 *     summary: Redireciona para a página de confirmação de email no frontend
 *     tags:
 *       - Infra
 *     responses:
 *       302:
 *         description: Redirecionamento para o frontend
 */
app.get('/confirmar-email', redirectToFrontendRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/animes', animesRoutes);
app.use('/', interacoesRoutes);
app.use('/', watchProgressRoutes);
app.use('/', rankingRoutes);
app.use('/personagens', personagensRoutes);
app.use('/episodios', episodiosRoutes);
app.use('/', sessionsRoutes);
app.use('/', adminRoutes);
app.use('/', favoritosRoutes);
app.use('/', avaliacoesRoutes);
app.use('/', progressosRoutes);
app.use('/', batchRoutes);
app.use('/', exportRoutes);
app.use('/', infraRoutes);
app.use('/', webhooksRoutes);
app.use('/', estudiosRoutes);
app.use('/', estacoesRoutes);

app.use((_req, res) => {
    res.status(404).json({
        message: 'Rota não encontrada',
    });
});

app.use(errorMiddleware);

export default app;