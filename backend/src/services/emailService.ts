import { sendMail } from '../config/mailer';
const MAIL_FROM = process.env.MAIL_FROM;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export const sendPasswordResetEmail = async (
    email: string,
    token: string
): Promise<void> => {
    if (!MAIL_FROM) {
        throw new Error('Configuração de email não definida: MAIL_FROM ausente');
    }

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    const subject = 'Recuperação de senha - Central de Anime';
    const text = `Olá! Recebemos uma solicitação para redefinir sua senha na Central de Anime. Acesse este link para criar uma nova senha: ${resetUrl} Este link expira em 30 minutos. Se você não solicitou a redefinição, ignore este email.`;
    const html = `<p>Olá!</p><p>Recebemos uma solicitação para redefinir sua senha na <strong>Central de Anime</strong>.</p><p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a></p><p>Este link expira em 30 minutos.</p><p>Se você não solicitou a redefinição, ignore este email.</p>`;

    try {
        const info = await sendMail({
            from: MAIL_FROM,
            to: email,
            subject,
            text,
            html,
        });

        if (!info || !('messageId' in info)) {
            throw new Error('Falha ao enviar email via SMTP');
        }

        return;
    } catch (err) {
        console.error('Erro ao enviar email via SMTP:', err);
        throw err;
    }
};

export const sendPasswordResetConfirmationEmail = async (
    email: string
): Promise<void> => {
    if (!MAIL_FROM) {
        throw new Error('Configuração de email não definida: MAIL_FROM ausente');
    }

    const subject = 'Senha redefinida - Central de Anime';
    const text = `Sua senha foi alterada com sucesso. Se você não reconhece essa alteração, entre em contato com o suporte.`;
    const html = `<p>Sua senha foi alterada com sucesso.</p><p>Se você não reconhece essa alteração, entre em contato com o suporte imediatamente.</p>`;

    try {
        const info = await sendMail({
            from: MAIL_FROM,
            to: email,
            subject,
            text,
            html,
        });

        if (!info || !('messageId' in info)) {
            throw new Error('Falha ao enviar email de confirmação via SMTP');
        }

        return;
    } catch (err) {
        console.error('Erro ao enviar email de confirmação via SMTP:', err);
        throw err;
    }
};