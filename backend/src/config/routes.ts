import express, { Express, Request, Response, NextFunction } from 'express';
import { animesRouter } from '../routes/animesRouter';
import { generosRouter } from '../routes/generosRouter';
import { estudiosRouter } from '../routes/estudiosRouter';
import { personagensRouter } from '../routes/personagensRouter';
import { plataformasRouter } from '../routes/plataformasRouter';
import { statusRouter } from '../routes/statusRouter';
import { tagsRouter } from '../routes/tagsRouter';
import { estacoesRouter } from '../routes/estacoesRouter';
import { relacoesRouter } from '../routes/relacoesRouter';
import { adminRouter } from '../routes/admin/adminRouter';
import comentariosRouter from '../routes/comentariosRouter';
import { healthRouter } from '../routes/healthRouter';
import { dadosRouter } from '../routes/dadosRouter';
import { estatisticasRouter } from '../routes/estatisticasRouter';
import { uploadsRouter } from '../routes/uploadsRouter';
import { sessoesRouter } from '../routes/usuarios/sessoesRouter';
import { usuariosRouter } from '../routes/usuarios/usuariosRouter';
import { filtrosRouter } from '../routes/filtrosRouter';
import { emailRouter } from '../routes/emailRouter';
import { apiVersion } from '../middleware/apiVersion.middleware';

export function setupRoutes(app: Express) {
  app.use('/health', healthRouter);

  const v1 = express.Router();

  v1.use(uploadsRouter);

  v1.use('/animes', animesRouter);
  v1.use('/generos', generosRouter);
  v1.use('/estudios', estudiosRouter);
  v1.use('/personagens', personagensRouter);
  v1.use('/plataformas', plataformasRouter);
  v1.use('/status', statusRouter);
  v1.use('/tags', tagsRouter);
  v1.use('/estacoes', estacoesRouter);
  v1.use('/relacoes', relacoesRouter);
  v1.use('/comentarios', comentariosRouter);
  v1.use('/filtros', filtrosRouter);
  v1.use('/sessoes', sessoesRouter);
  v1.use('/dados', dadosRouter);
  v1.use('/estatisticas', estatisticasRouter);
  v1.use('/usuarios', usuariosRouter);
  v1.use('/admin', adminRouter);
  v1.use('/email', emailRouter);

  // Expor as rotas também na raiz para compatibilidade com requests sem prefixo /v1
  app.use('/', v1);

  // Mantemos o namespace /v1 também para versões explícitas da API
  app.use('/v1', apiVersion(['v1']), v1);
}
