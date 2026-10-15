import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('emailService', () => {
  const envOriginal = {
    MAIL_FROM: process.env.MAIL_FROM,
    FRONTEND_URL: process.env.FRONTEND_URL,
  };

  beforeEach(() => {
    vi.resetModules();
    process.env.MAIL_FROM = 'noreply@central.test';
    process.env.FRONTEND_URL = 'https://frontend.test';
  });

  afterEach(() => {
    process.env.MAIL_FROM = envOriginal.MAIL_FROM;
    process.env.FRONTEND_URL = envOriginal.FRONTEND_URL;
    vi.restoreAllMocks();
  });

  it('deve enviar email de reset com link esperado', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await service.sendPasswordResetEmail('user@teste.com', 'token xyz');

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'noreply@central.test',
      to: 'user@teste.com',
      subject: 'Recuperação de senha - Central de Anime',
      text: expect.stringContaining('https://frontend.test/reset-password?token=token%20xyz'),
      html: expect.stringContaining('Redefinir minha senha'),
    }));
  });

  it('deve propagar falha do provedor ao enviar email de confirmação', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetConfirmationEmail('user@teste.com')).rejects.toThrow('Falha ao enviar email de confirmação via SMTP');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro se MAIL_FROM estiver ausente no envio de reset', async () => {
    delete process.env.MAIL_FROM;
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetEmail('user@teste.com', 'token')).rejects.toThrow('Configuração de email não definida: MAIL_FROM ausente');
  });

  it('deve lançar erro se MAIL_FROM estiver ausente na confirmação de reset', async () => {
    delete process.env.MAIL_FROM;
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetConfirmationEmail('user@teste.com')).rejects.toThrow('Configuração de email não definida: MAIL_FROM ausente');
  });

  it('deve lançar erro quando envio de reset não retornar messageId', async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetEmail('user@teste.com', 'token')).rejects.toThrow('Falha ao enviar email via SMTP');
  });

  it('deve propagar exceção caso transporte falhe no envio de reset', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('Conexão SMTP recusada'));
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetEmail('user@teste.com', 'token')).rejects.toThrow('Conexão SMTP recusada');
  });

  it('deve enviar email de confirmação de senha com sucesso', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'conf-123' });
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetConfirmationEmail('user@teste.com')).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@teste.com',
      subject: 'Senha redefinida - Central de Anime',
      html: expect.stringContaining('Senha atualizada com sucesso'),
    }));
  });

  it('deve propagar erro quando transporte lançar exceção na confirmação de senha', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('Erro de rede'));
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendPasswordResetConfirmationEmail('user@teste.com')).rejects.toThrow('Erro de rede');
  });

  it('deve enviar email de confirmação de cadastro com sucesso', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'register-123' });
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendRegisterConfirmationEmail('user@teste.com', 'Nami', 'jwt-token')).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@teste.com',
      subject: 'Confirme seu cadastro - Central de Anime',
      text: expect.stringContaining('Ative sua conta por este link'),
      html: expect.stringContaining('confirmar-email?token=jwt-token'),
    }));
  });

  it('deve lançar erro quando envio de confirmação de cadastro não retornar messageId', async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    vi.doMock('../../config/mailer', () => ({ sendMail }));
    const service = await import('../../services/emailService');

    await expect(service.sendRegisterConfirmationEmail('user@teste.com', 'Nami', 'jwt-token')).rejects.toThrow('Falha ao enviar email de confirmação de cadastro via SMTP');
  });
});