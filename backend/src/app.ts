import './config/env';
import express from 'express';
import animesRouter from './routes/animesRouter';
import { generosRouter } from './routes/generosRouter';
import { estudiosRouter } from './routes/estudiosRouter';
import { personagensRouter } from './routes/personagensRouter';
import { plataformasRouter } from './routes/plataformasRouter';
import { statusRouter } from './routes/statusRouter';
import { tagsRouter } from './routes/tagsRouter';
import { estacoesRouter } from './routes/estacoesRouter';
import { relacoesRouter } from './routes/relacoesRouter';
import adminRouter from './routes/admin/adminRouter';
import { healthRouter } from './routes/healthRouter';
import { dadosRouter } from './routes/dadosRouter';
import { estatisticasRouter } from './routes/estatisticasRouter';
import { setupSwagger } from './config/swagger';
import uploadsRouter from './routes/uploadsRouter';
import {
  badRequestHandler,
  notFoundHandler,
  errorHandler,
} from './middleware/errorHandler';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import session from 'express-session';
import { passport } from './middleware/passaport';
import { usuariosRouter } from './routes/usuarios/usuariosRouter';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());

const imagensCapasPath = path.resolve(__dirname, '../images/capas');
const imagensPersonagensPath = path.resolve(__dirname, '../images/personagens');
if (!fs.existsSync(imagensCapasPath))
  fs.mkdirSync(imagensCapasPath, { recursive: true });
if (!fs.existsSync(imagensPersonagensPath))
  fs.mkdirSync(imagensPersonagensPath, { recursive: true });
app.use('/images/capas', express.static(imagensCapasPath));
app.use('/images/personagens', express.static(imagensPersonagensPath));

app.use(session({ secret: 'segredo', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/health', healthRouter);
app.use(uploadsRouter);
app.use('/animes', animesRouter);
app.use('/generos', generosRouter);
app.use('/estudios', estudiosRouter);
app.use('/personagens', personagensRouter);
app.use('/plataformas', plataformasRouter);
app.use('/status', statusRouter);
app.use('/tags', tagsRouter);
app.use('/estacoes', estacoesRouter);
app.use('/relacoes', relacoesRouter);

app.use('/dados', dadosRouter);
app.use('/estatisticas', estatisticasRouter);
app.use('/usuarios', usuariosRouter);
app.use('/admin', adminRouter);

setupSwagger(app);

app.use(badRequestHandler);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
