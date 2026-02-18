import jwt, { type JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';

const GOOGLE_JWK_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = new Set([
  'https://accounts.google.com',
  'accounts.google.com',
]);

type GoogleIdTokenPayload = JwtPayload & {
  sub: string;
  email?: string;
  email_verified?: boolean;
  iss: string;
  aud: string | string[];
};

type GoogleJwk = {
  kid: string;
  kty: 'RSA';
  use?: string;
  alg?: string;
  n: string;
  e: string;
  x5c?: string[];
  x5t?: string;
};

type GoogleJwksResponse = { keys: GoogleJwk[] };

let googleKeyCache: { expMs: number; keys: GoogleJwk[] } = {
  expMs: 0,
  keys: [],
};

function getCacheMaxAgeSeconds(headers: Record<string, unknown>): number {
  const cc = headers['cache-control'];
  if (typeof cc !== 'string') return 300;
  const match = cc.match(/max-age=(\d+)/);
  return match ? parseInt(match[1], 10) : 300;
}

async function getGoogleJwks(): Promise<GoogleJwk[]> {
  const now = Date.now();

  if (googleKeyCache.keys.length && now < googleKeyCache.expMs) {
    return googleKeyCache.keys;
  }

  const res = await axios.get<GoogleJwksResponse>(GOOGLE_JWK_URL, {
    timeout: 5000,
  });
  const maxAge = getCacheMaxAgeSeconds(res.headers as Record<string, unknown>);

  googleKeyCache = {
    keys: res.data.keys ?? [],
    expMs: now + maxAge * 1000,
  };

  return googleKeyCache.keys;
}

function parseJwtHeader(token: string): { kid?: string; alg?: string } {
  const [headerB64] = token.split('.');
  if (!headerB64) throw new Error('Token malformado');

  const headerJson = Buffer.from(headerB64, 'base64').toString('utf8');
  const parsed: unknown = JSON.parse(headerJson);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Header JWT inválido');
  }

  const kid = (parsed as Record<string, unknown>).kid;
  const alg = (parsed as Record<string, unknown>).alg;

  return {
    kid: typeof kid === 'string' ? kid : undefined,
    alg: typeof alg === 'string' ? alg : undefined,
  };
}

export function looksLikeGoogleJwt(token: string): boolean {
  const { kid, alg } = parseJwtHeader(token);
  return alg === 'RS256' && !!kid;
}

export async function verifyGoogleIdToken(
  token: string,
): Promise<GoogleIdTokenPayload> {
  const { kid, alg } = parseJwtHeader(token);

  if (alg !== 'RS256') throw new Error('Algoritmo inválido no token Google');
  if (!kid) throw new Error('JWT sem kid');

  const keys = await getGoogleJwks();
  const jwk = keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error('Chave pública do Google não encontrada');

  const pem = jwkToPem(jwk);

  const payload = jwt.verify(token, pem, {
    algorithms: ['RS256'],
  }) as GoogleIdTokenPayload;

  if (!GOOGLE_ISSUERS.has(payload.iss)) throw new Error('Issuer inválido');

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) throw new Error('GOOGLE_CLIENT_ID não configurado');

  const audOk = Array.isArray(payload.aud)
    ? payload.aud.includes(googleClientId)
    : payload.aud === googleClientId;

  if (!audOk) throw new Error('Audience inválido');

  return payload;
}

export type { GoogleIdTokenPayload };