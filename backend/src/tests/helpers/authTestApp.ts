import express from 'express';
import jwt from 'jsonwebtoken';
import { authController } from '../../controllers/authController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import SessionsRouter from '../../routes/sessions';

export function createAuthTestApp() {
  const app = express();
  app.use(express.json());
  app.post('/auth/login', authController.login);
  app.post('/auth/refresh', authController.refresh);
  app.post('/auth/logout', authController.logout);
  app.post('/auth/reset-password', authController.resetPassword);
  app.use(SessionsRouter);
  app.get('/protected', authMiddleware, (req, res) => res.json(req.user));
  return app;
}

export function readAccessIdentity(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET esperado no teste');
  const claims = jwt.verify(token, secret);
  if (typeof claims === 'string' || typeof claims.sid !== 'number') {
    throw new Error('JWT com sid esperado no teste');
  }
  return { userId: Number(claims.sub), sessionId: claims.sid };
}

export function expireAccessToken(token: string) {
  const identity = readAccessIdentity(token);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET esperado no teste');
  return jwt.sign(
    { sub: String(identity.userId), sid: identity.sessionId },
    secret,
    { expiresIn: -1 },
  );
}
