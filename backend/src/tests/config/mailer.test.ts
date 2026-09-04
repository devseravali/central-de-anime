import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type nodemailer from 'nodemailer';

describe('Configuração: mailer', () => {
  const envOriginal = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.SMTP_HOST = envOriginal.SMTP_HOST;
    process.env.SMTP_PORT = envOriginal.SMTP_PORT;
    process.env.SMTP_USER = envOriginal.SMTP_USER;
    process.env.SMTP_PASS = envOriginal.SMTP_PASS;
    vi.restoreAllMocks();
  });

  it('deve retornar null em getTransporter quando credenciais SMTP estiverem incompletas', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const { getTransporter } = await import('../../config/mailer');
    const transporter = getTransporter();

    expect(transporter).toBeNull();
  });

  it('deve lançar erro em sendMail se SMTP não estiver configurado', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const { sendMail } = await import('../../config/mailer');

    await expect(
      sendMail({ to: 'dest@teste.com', subject: 'Teste', text: 'Ola' })
    ).rejects.toThrow('SMTP não configurado');
  });

  it('deve instanciar nodemailer.createTransport com opções corretas quando SMTP estiver configurado', async () => {
    process.env.SMTP_HOST = 'smtp.teste.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'usuario_smtp';
    process.env.SMTP_PASS = 'senha_smtp';

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-123' });
    const createTransportMock = vi.fn().mockReturnValue({
      sendMail: sendMailMock,
    });

    vi.doMock('nodemailer', () => ({
      default: {
        createTransport: createTransportMock,
      },
      createTransport: createTransportMock,
    }));

    const { getTransporter, sendMail } = await import('../../config/mailer');
    const transporter = getTransporter();

    expect(transporter).not.toBeNull();
    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.teste.com',
        port: 465,
        secure: true,
        auth: {
          user: 'usuario_smtp',
          pass: 'senha_smtp',
        },
      })
    );

    const opcoesEmail: nodemailer.SendMailOptions = {
      from: 'remetente@teste.com',
      to: 'destinatario@teste.com',
      subject: 'Assunto',
      text: 'Mensagem',
    };

    const resultado = await sendMail(opcoesEmail);

    expect(sendMailMock).toHaveBeenCalledWith(opcoesEmail);
    expect(resultado).toEqual({ messageId: 'msg-123' });
  });

  it('deve configurar porta padrão 587 e secure false para portas diferentes de 465', async () => {
    process.env.SMTP_HOST = 'smtp.teste.com';
    delete process.env.SMTP_PORT;
    process.env.SMTP_USER = 'usuario_smtp';
    process.env.SMTP_PASS = 'senha_smtp';

    const createTransportMock = vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    });

    vi.doMock('nodemailer', () => ({
      default: {
        createTransport: createTransportMock,
      },
      createTransport: createTransportMock,
    }));

    const { getTransporter } = await import('../../config/mailer');
    getTransporter();

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 587,
        secure: false,
      })
    );
  });
});
