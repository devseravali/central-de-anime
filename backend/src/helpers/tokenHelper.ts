import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no ambiente');
}

interface TokenPayload {
  usuarioId: number;
  role?: string;
}

export function gerarToken(
  usuarioId: number,
  expiresIn: SignOptions['expiresIn'] = '1h',
  role?: string,
): string {
  const payload: TokenPayload = { usuarioId, ...(role ? { role } : {}) };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

export function verificarToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.usuarioId) {
      return null;
    }

    return {
      usuarioId: decoded.usuarioId as number,
    };
  } catch (error) {
    return null;
  }
}
