import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkCriticalEnv } from '../../config/envCheck';

describe('Configuração: envCheck', () => {
  const envOriginal = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...envOriginal };
  });

  it('deve emitir aviso com lista de variáveis ausentes quando faltarem variáveis críticas', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.MAIL_FROM;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    checkCriticalEnv();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[env-check] Variáveis de ambiente ausentes:')
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('DATABASE_URL')
    );
  });

  it('deve emitir log informativo em ambiente de desenvolvimento quando todas as variáveis estiverem presentes', () => {
    process.env.DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/teste';
    process.env.JWT_SECRET = 'segredoteste';
    process.env.MAIL_FROM = 'noreply@teste.com';
    process.env.SMTP_HOST = 'smtp.teste.com';
    process.env.SMTP_USER = 'smtpuser';
    process.env.NODE_ENV = 'development';

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    checkCriticalEnv();

    expect(infoSpy).toHaveBeenCalledWith(
      '[env-check] Todas as variáveis críticas presentes'
    );
  });

  it('não deve emitir log informativo em ambiente de produção mesmo com todas variáveis presentes', () => {
    process.env.DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/teste';
    process.env.JWT_SECRET = 'segredoteste';
    process.env.MAIL_FROM = 'noreply@teste.com';
    process.env.SMTP_HOST = 'smtp.teste.com';
    process.env.SMTP_USER = 'smtpuser';
    process.env.NODE_ENV = 'production';

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    checkCriticalEnv();

    expect(infoSpy).not.toHaveBeenCalled();
  });
});
