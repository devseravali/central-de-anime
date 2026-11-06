import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type nodemailer from 'nodemailer';

vi.mock('../../config/environment', async importOriginal => ({
  ...await importOriginal<typeof import('../../config/environment')>(),
  loadEnvironment: () => ({
    mailEnabled: process.env.APP_ENV === 'production' && process.env.RENDER === 'true',
    values: { ...process.env },
  }),
}));

describe('Configuração: mailer', () => {
  const envOriginal = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('RENDER', 'true');
  });

  afterEach(() => {
    process.env.SMTP_HOST = envOriginal.SMTP_HOST;
    process.env.SMTP_PORT = envOriginal.SMTP_PORT;
    process.env.SMTP_USER = envOriginal.SMTP_USER;
    process.env.SMTP_PASS = envOriginal.SMTP_PASS;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it.each(['local', 'staging', 'test'])('bloqueia email real em %s mesmo com SMTP herdado', async environment => {
    vi.stubEnv('APP_ENV', environment);
    const { sendMail } = await import('../../config/mailer');
    await expect(sendMail({ to: 'example@example.invalid', text: 'blocked' }))
      .rejects.toThrow('desabilitado');
  });

  it('bloqueia email em producao iniciada fora do Render', async () => {
    vi.stubEnv('RENDER', 'false');
    const { sendMail } = await import('../../config/mailer');
    await expect(sendMail({ text: 'blocked' })).rejects.toThrow('desabilitado');
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
    expect(createTransportMock.mock.calls[0][0]).not.toHaveProperty('tls');

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
    expect(createTransportMock.mock.calls[0][0]).not.toHaveProperty('tls');
  });
});
