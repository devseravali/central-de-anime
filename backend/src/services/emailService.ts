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
        console.error('Erro ao enviar email via SMTP:', err instanceof Error ? err.message : String(err));
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
        console.error('Erro ao enviar email de confirmação via SMTP:', err instanceof Error ? err.message : String(err));
        throw err;
    }
};

const buildEmailLayout = (
    title: string,
    subtitle: string,
    bodyHtml: string,
    footerText: string
): string => {
    return `
        <div style="background:#f3f6ff;padding:24px;font-family:Arial,sans-serif;color:#1f2937;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <tr>
                    <td style="padding:24px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;">
                        <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.9;">Central de Anime</p>
                        <h1 style="margin:0;font-size:24px;line-height:1.3;">${title}</h1>
                        <p style="margin:10px 0 0;font-size:14px;opacity:.95;">${subtitle}</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px;line-height:1.7;font-size:15px;">
                        ${bodyHtml}
                    </td>
                </tr>
                <tr>
                    <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                        ${footerText}
                    </td>
                </tr>
            </table>
        </div>
    `;
};

export const sendRegisterConfirmationEmail = async (
    email: string,
    nome: string
): Promise<void> => {
    if (!MAIL_FROM) {
        throw new Error('Configuração de email não definida: MAIL_FROM ausente');
    }

    const subject = 'Cadastro confirmado - Central de Anime';
    const text = `Olá, ${nome}! Seu cadastro na Central de Anime foi confirmado com sucesso. Agora você já pode acessar sua conta e começar a acompanhar seus animes favoritos.`;
    const html = buildEmailLayout(
        'Cadastro confirmado com sucesso',
        'Sua conta está pronta para uso',
        `<p>Olá, <strong>${nome}</strong>!</p>
         <p>Seu cadastro na <strong>Central de Anime</strong> foi confirmado com sucesso.</p>
         <p>Agora você já pode acessar sua conta, montar sua lista e acompanhar seus episódios em tempo real.</p>
         <p style="margin:20px 0 0;">Se você não reconhece este cadastro, recomendamos alterar a senha imediatamente.</p>`,
        'Este é um e-mail automático. Não responda esta mensagem.'
    );

    try {
        const info = await sendMail({
            from: MAIL_FROM,
            to: email,
            subject,
            text,
            html,
        });

        if (!info || !('messageId' in info)) {
            throw new Error('Falha ao enviar email de confirmação de cadastro via SMTP');
        }

        return;
    } catch (err) {
        console.error('Erro ao enviar email de confirmação de cadastro via SMTP:', err instanceof Error ? err.message : String(err));
        throw err;
    }
};