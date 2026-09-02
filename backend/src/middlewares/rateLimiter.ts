import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const toInt = (v: string | undefined, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const LOGIN_MAX = toInt(process.env.RATE_LIMIT_LOGIN_MAX, 5);
const REGISTER_MAX = toInt(process.env.RATE_LIMIT_REGISTER_MAX, 5);
const FORGOT_MAX = toInt(process.env.RATE_LIMIT_FORGOT_MAX, 5);
const WINDOW_MS = toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000); // 1 minute

function createLimiter(options: { windowMs: number; max: number; message: string }): RequestHandler {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
            res.status(429).json({ message: options.message });
        },
    });
}

export const loginRateLimiter = createLimiter({
    windowMs: WINDOW_MS,
    max: LOGIN_MAX,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
});

export const registerRateLimiter = createLimiter({
    windowMs: WINDOW_MS,
    max: REGISTER_MAX,
    message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
});

export const forgotRateLimiter = createLimiter({
    windowMs: WINDOW_MS,
    max: FORGOT_MAX,
    message: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
});

export default {
    loginRateLimiter,
    registerRateLimiter,
    forgotRateLimiter,
};
