import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 3000);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export function getTransporter() {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 3000,
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
