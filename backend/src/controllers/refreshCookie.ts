import type { Request } from 'express';

export class InvalidRefreshCookieError extends Error {
    constructor() {
        super('Refresh token inválido');
    }
}

const validateValue = (value: unknown): string => {
    // Unquoted cookie-octet: excludes whitespace, controls and cookie delimiters.
    if (typeof value !== 'string' || !/^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/.test(value)) {
        throw new InvalidRefreshCookieError();
    }
    return value;
};

export const readRefreshCookie = (req: Request): string | undefined => {
    const header = req.headers.cookie;
    if (header !== undefined) {
        let value: string | undefined;
        for (const part of header.split(';')) {
            const pair = part.trim();
            const separator = pair.indexOf('=');
            const name = separator < 0 ? pair : pair.slice(0, separator);
            if (name.trim() !== 'refreshToken') continue;
            if (name !== 'refreshToken' || separator < 0 || value !== undefined) {
                throw new InvalidRefreshCookieError();
            }
            value = validateValue(pair.slice(separator + 1));
        }
        return value;
    }

    const cookies: unknown = req.cookies;
    if (cookies && typeof cookies === 'object' && 'refreshToken' in cookies) {
        return validateValue(cookies.refreshToken);
    }
    return undefined;
};
