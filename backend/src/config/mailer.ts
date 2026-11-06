import nodemailer from 'nodemailer';
import { EnvironmentError, loadEnvironment } from './environment';

export function getTransporter() {
    const { mailEnabled, values } = loadEnvironment();
    if (!mailEnabled) {
        throw new EnvironmentError('Envio de email desabilitado fora do deploy de producao.');
    }
    const SMTP_HOST = values.SMTP_HOST;
    const SMTP_PORT = Number(values.SMTP_PORT ?? 587);
    const SMTP_USER = values.SMTP_USER;
    const SMTP_PASS = values.SMTP_PASS;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        authMethod: 'LOGIN',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

export async function sendMail(options: nodemailer.SendMailOptions) {
    const transporter = getTransporter();
    if (!transporter) {
        throw new Error('SMTP não configurado');
    }

    return transporter.sendMail(options);
}

export default {
    getTransporter,
    sendMail,
};
