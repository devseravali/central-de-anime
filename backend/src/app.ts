import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

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

export default app;
