import { sendMail } from '../config/mailer';
const MAIL_FROM = process.env.MAIL_FROM;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

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
    const text = `Olá, treinador otaku! Recebemos um pedido para recuperar sua conta na Central de Anime. Use este link para criar uma nova senha: ${resetUrl}. Esse portal expira em 30 minutos. Se não foi você, pode ignorar esta mensagem.`;
    const html = buildEmailLayout(
        'Recupere seu acesso e volte para a maratona',
        'Detectamos um pedido de recuperação da sua conta otaku',
        `<p>Olá, treinador otaku!</p>
         <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Central de Anime</strong>.</p>
         <p>Para continuar sua jornada, clique no botão abaixo:</p>
         <p style="margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;">Redefinir minha senha</a>
         </p>
         <p>Se preferir, copie e cole este link no navegador:</p>
         <p><a href="${resetUrl}">${resetUrl}</a></p>
         <p>Esse portal expira em <strong>30 minutos</strong>.</p>
         <p style="margin:20px 0 0;">Se não foi você quem pediu a alteração, ignore este email com tranquilidade.</p>`,
        'Mensagem automática de recuperação de conta. Não responda este email.'
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
    const text = `Sua senha foi alterada com sucesso na Central de Anime. Se não foi você, troque a senha imediatamente e contate o suporte.`;
    const html = buildEmailLayout(
        'Senha atualizada com sucesso',
        'Seu perfil está protegido e pronto para novas temporadas',
        `<p>Missão concluída!</p>
         <p>Confirmamos que a senha da sua conta na <strong>Central de Anime</strong> foi redefinida com sucesso.</p>
         <p>Se foi você quem realizou essa alteração, já pode voltar para sua lista e continuar a maratona.</p>
         <p>Se você <strong>não reconhece</strong> essa alteração, recomendamos trocar sua senha imediatamente e entrar em contato com o suporte.</p>`,
        'Se notar qualquer atividade suspeita, revise os dispositivos conectados e atualize suas credenciais.'
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
    nome: string,
    token: string
): Promise<void> => {
    if (!MAIL_FROM) {
        throw new Error('Configuração de email não definida: MAIL_FROM ausente');
    }

    const verifyUrl = `${FRONTEND_URL}/confirmar-email?token=${encodeURIComponent(token)}`;
    const subject = 'Confirme seu cadastro - Central de Anime';
    const text = `Olá, ${nome}! Seu cadastro na Central de Anime está quase pronto. Ative sua conta por este link: ${verifyUrl}.`;
    const html = buildEmailLayout(
        'Ative sua conta e entre na central otaku',
        'Falta só um passo para liberar seu acesso completo',
        `<p>Olá, <strong>${nome}</strong>!</p>
         <p>Recebemos seu cadastro na <strong>Central de Anime</strong>.</p>
         <p>Para ativar sua conta e começar sua jornada, confirme seu email clicando no botão abaixo:</p>
         <p style="margin:24px 0;">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;">Confirmar meu email</a>
         </p>
         <p>Se preferir, copie e cole este link no navegador:</p>
         <p><a href="${verifyUrl}">${verifyUrl}</a></p>
         <p style="margin:20px 0 0;">Se você não reconhece este cadastro, ignore este email.</p>`,
        'Mensagem automática da Central de Anime. Não responda este email.'
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