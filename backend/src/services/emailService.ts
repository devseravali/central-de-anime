import { Resend } from 'resend';
import { sendMail } from '../config/mailer';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
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

    if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: MAIL_FROM,
            to: email,
            subject,
            text,
            html,
        });

        if (error) {
            throw new Error(`Falha ao enviar email: ${error.message}`);
        }

        return;
    }

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
    
    }

    throw new Error('Configuração de email não definida: forneça RESEND_API_KEY ou parâmetros SMTP');
};