import { Request, Response, CookieOptions } from 'express';
import { authService } from '../services/authService';

export const authController = {
    login: async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                res.status(400).json({
                    message: 'Email e senha são obrigatórios',
                });
                return;
            }

            const dispositivo =
                typeof req.body?.dispositivo === 'string'
                    ? req.body.dispositivo
                    : null;

            const ip = req.ip ?? null;

            const userAgent = req.get('user-agent') ?? null;

            const result = await authService.login(
                email,
                senha,
                dispositivo,
                ip,
                userAgent
            );

            const refreshCookieOptions: CookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
                path: '/auth',
            };

            const maxAgeDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
            refreshCookieOptions.maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

            res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

            res.status(200).json({
                user: result.user,
                accessToken: result.accessToken,
                refreshExpiraEm: result.refreshExpiraEm,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Erro ao realizar login';
                    
            if (message === 'Email ou senha inválidos') {
                res.status(401).json({ message });
                return;
            }

            console.error('Erro no login:', error instanceof Error ? error.message : String(error));

            res.status(500).json({
                message: 'Erro interno do servidor',
            });
        }
    },

    register: async (req: Request, res: Response): Promise<void> => {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                res.status(400).json({
                    message: 'Nome, email e senha são obrigatórios',
                });
                return;
            }

            const user = await authService.register(nome, email, senha);

            res.status(201).json(user);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Erro ao registrar usuário';

            if (message === 'Email já cadastrado') {
                res.status(409).json({ message });
                return;
            }

            console.error('Erro no register:', error instanceof Error ? error.message : String(error));

            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    refresh: async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshTokenFromBody = req.body?.refreshToken as string | undefined;
            const cookieHeader = req.headers.cookie as string | undefined;
            const refreshTokenFromCookie = req.cookies?.refreshToken ?? (cookieHeader ? cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('refreshToken='))?.split('=')[1] : undefined);

            const refreshToken = refreshTokenFromBody ?? refreshTokenFromCookie;

            if (!refreshToken) {
                res.status(400).json({ message: 'Refresh token é obrigatório' });
                return;
            }

            const result = await authService.refresh(refreshToken);

            const refreshCookieOptions: CookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
                path: '/auth',
            };

            const maxAgeDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
            refreshCookieOptions.maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

            res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

            res.status(200).json({ accessToken: result.accessToken, user: result.user, refreshExpiraEm: result.refreshExpiraEm });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Refresh token inválido';

            res.status(401).json({
                message,
            });
        }
    },

    forgotPassword: async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body ?? {};

        if (typeof email !== 'string' || !email.trim()) {
            res.status(400).json({ message: 'Email é obrigatório' });
            return;
        }

        try {
            const resetToken = await authService.requestPasswordReset(email);
            const response: { message: string; resetToken?: string } = {
                message: 'Email enviado, você receberá instruções para redefinir sua senha',
            };

            if (resetToken && process.env.NODE_ENV !== 'production') {
                response.resetToken = resetToken;
            }

            res.status(200).json(response);
        } catch (error) {
            console.error('Erro ao solicitar recuperação de senha:', error instanceof Error ? error.message : String(error));
            res.status(200).json({ message: 'Email enviado, você receberá instruções para redefinir sua senha' });
        }
    },

    resetPassword: async (req: Request, res: Response): Promise<void> => {
        const { token, novaSenha } = req.body ?? {};

        if (
            typeof token !== 'string' ||
            !token ||
            typeof novaSenha !== 'string' ||
            novaSenha.length < 6
        ) {
            res.status(400).json({
                message: 'Token e nova senha com no mínimo 6 caracteres são obrigatórios',
            });
            return;
        }

        try {
            const result = await authService.resetPassword(token, novaSenha);
            res.status(200).json({ message: 'Senha redefinida com sucesso', ...result });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Token de recuperação expirado ou inválido';

            if (message === 'Token de recuperação expirado ou inválido') {
                res.status(400).json({ message });
                return;
            }

            console.error('Erro ao redefinir senha:', error instanceof Error ? error.message : String(error));
            res.status(500).json({ message: 'Erro ao redefinir senha' });
        }
    },

    logout: async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshTokenFromBody = req.body?.refreshToken as string | undefined;
            const cookieHeader = req.headers.cookie as string | undefined;
            const refreshTokenFromCookie = req.cookies?.refreshToken ?? (cookieHeader ? cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('refreshToken='))?.split('=')[1] : undefined);

            const refreshToken = refreshTokenFromBody ?? refreshTokenFromCookie;

            if (!refreshToken) {
                res.status(400).json({ message: 'Refresh token é obrigatório' });
                return;
            }

            await authService.logout(refreshToken);

            const cookieOptions: CookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
                path: '/auth',
            };

            res.clearCookie('refreshToken', cookieOptions);

            res.status(200).json({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Erro ao realizar logout';
            if (
                message === 'Refresh token inválido' ||
                message === 'Sessão não encontrada'
            ) {
                res.status(400).json({ message });
                return;
            }

            console.error('Erro no logout:', error instanceof Error ? error.message : String(error));

            res.status(500).json({
                message: 'Erro interno do servidor',
            });
        }
    },
};