import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { logger } from '../utils/logging';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddlewares(app: express.Express) {
  app.use((req, res, next) => {
    if (
      req.url.includes('..') ||
      req.originalUrl.includes('..') ||
      req.url.includes('%2e%2e') ||
      req.originalUrl.includes('%2e%2e')
    ) {
      return res.status(400).json({
        sucesso: false,
        dados: null,
        erro: {
          mensagem: 'Nome de arquivo inválido',
          codigo: 'INVALID_FILE_NAME',
          timestamp: new Date().toISOString(),
        },
      });
    }
    next();
  });

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );

  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  app.use(
    '/avatars',
    express.static(path.join(__dirname, '../images/avatars')),
  );

  app.use(
    '/images/personagens',
    express.static(path.join(__dirname, '../images/personagens')),
  );

  app.use(
    '/images/capas',
    express.static(path.join(__dirname, '../images/capas')),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      name: env.SESSION_NAME || 'sid',
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,

      cookie: {
        maxAge: Number(env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
        httpOnly: true,
      },

      store: (() => {
        try {
          if (env.SESSION_STORE === 'pg' && env.DATABASE_URL) {
            const ConnectPgSimple = require('connect-pg-simple');
            const PgStore = ConnectPgSimple(session);

            logger.info('Using Postgres session store');

            return new PgStore({
              conString: env.DATABASE_URL,
            }) as session.Store;
          }
        } catch (e: unknown) {
          const errMsg =
            e && typeof e === 'object' && 'message' in e
              ? String((e as Record<string, unknown>).message)
              : String(e);

          logger.warn(
            'Session store package not installed or failed to initialize',
            { error: errMsg },
          );
        }

        return undefined;
      })(),
    }),
  );

  app.use(
    '/avatares',
    express.static(path.resolve(__dirname, '../images/avatars')),
  );

  app.use(
    '/images/episodios',
    express.static(path.join(__dirname, '../images/episodios')),
  );

  app.use('/images/episodios', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(env.RATE_LIMIT_GLOBAL) || 1000,
    message: {
      sucesso: false,
      erro: {
        mensagem:
          'Muitas requisições a partir deste IP, tente novamente mais tarde',
        codigo: 'TOO_MANY_REQUESTS',
      },
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(env.RATE_LIMIT_AUTH) || 10,
    message: {
      sucesso: false,
      erro: {
        mensagem: 'Muitas tentativas de autenticação, tente mais tarde',
        codigo: 'TOO_MANY_REQUESTS',
      },
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(env.RATE_LIMIT_REGISTER) || 5,
    message: {
      sucesso: false,
      erro: {
        mensagem: 'Muitas tentativas de registro, tente mais tarde',
        codigo: 'TOO_MANY_REQUESTS',
      },
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  app.use('/sessoes', authLimiter);
  app.use('/sessoes/create', authLimiter);
  app.use('/usuarios/register', registerLimiter);

  app.use(limiter);
}