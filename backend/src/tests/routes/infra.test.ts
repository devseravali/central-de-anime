import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const mailFromOriginal = process.env.MAIL_FROM;
const nodeEnvOriginal = process.env.NODE_ENV;

const mailerMocks = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));

vi.mock('../../config/mailer', () => ({
  sendMail: mailerMocks.sendMail,
}));

import app from '../../app';

describe('Rotas de infraestrutura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MAIL_FROM = 'noreply@central.test';
    process.env.NODE_ENV = 'test';
  });

  it('deve retornar métricas públicas', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        uptime: expect.any(Number),
        memory: expect.any(Object),
      })
    );
  });

  it('deve usar development quando NODE_ENV não estiver definido', async () => {
    delete process.env.NODE_ENV;

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.body.env).toBe('development');
  });

  it('deve expor o json do OpenAPI', async () => {
    const response = await request(app).get('/docs/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      info: { title: 'API', version: '0.0.1' },
      paths: {},
    });
  });

  it('deve expor a página html de documentação', async () => {
    const response = await request(app).get('/docs');

    expect(response.status).toBe(200);
    expect(response.text).toContain('API Docs');
    expect(response.text).toContain('/docs/openapi.json');
  });

  it('deve rejeitar teste de email sem destinatário', async () => {
    const response = await request(app).post('/test-email').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Campo "to" é obrigatório (body ou query)',
    });
    expect(mailerMocks.sendMail).not.toHaveBeenCalled();
  });

  it('deve enviar email de teste com sucesso', async () => {
    mailerMocks.sendMail.mockResolvedValueOnce({ messageId: 'abc-123' });

    const response = await request(app)
      .post('/test-email')
      .send({ to: 'destino@teste.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      info: { messageId: 'abc-123' },
    });
    expect(mailerMocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@central.test',
        to: 'destino@teste.com',
      })
    );
  });

  it('deve aceitar destinatário enviado pela query no POST', async () => {
    mailerMocks.sendMail.mockResolvedValueOnce({ messageId: 'query-123' });

    const response = await request(app)
      .post('/test-email?to=query@teste.com')
      .send({});

    expect(response.status).toBe(200);
    expect(mailerMocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@central.test',
        to: 'query@teste.com',
      })
    );
  });

  it('deve retornar 500 quando MAIL_FROM não estiver configurado no POST', async () => {
    delete process.env.MAIL_FROM;

    const response = await request(app)
      .post('/test-email')
      .send({ to: 'destino@teste.com' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'MAIL_FROM não configurado no .env',
    });
    expect(mailerMocks.sendMail).not.toHaveBeenCalled();
  });

  it('deve mascarar detalhes internos quando o envio falha', async () => {
    mailerMocks.sendMail.mockRejectedValueOnce(new Error('SMTP password=segredo token=abc'));

    const response = await request(app)
      .post('/test-email')
      .send({ to: 'destino@teste.com' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Falha ao enviar email' });
    expect(JSON.stringify(response.body).toLowerCase()).not.toContain('password');
    expect(JSON.stringify(response.body).toLowerCase()).not.toContain('token');
  });

  it('deve exigir o parâmetro to na rota GET de teste de email', async () => {
    const response = await request(app).get('/test-email');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Parâmetro "to" é obrigatório');
  });

  it('deve retornar 500 quando MAIL_FROM não estiver configurado no GET', async () => {
    delete process.env.MAIL_FROM;

    const response = await request(app).get('/test-email?to=destino@teste.com');

    expect(response.status).toBe(500);
    expect(response.text).toBe('MAIL_FROM não configurado no .env');
    expect(mailerMocks.sendMail).not.toHaveBeenCalled();
  });

  it('deve enviar email de teste com sucesso na rota GET', async () => {
    mailerMocks.sendMail.mockResolvedValueOnce({ messageId: 'get-123' });

    const response = await request(app).get('/test-email?to=destino@teste.com');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      info: { messageId: 'get-123' },
    });
    expect(mailerMocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@central.test',
        to: 'destino@teste.com',
        subject: 'Teste de envio - Central de Anime',
      })
    );
  });

  it('deve mascarar a falha de envio na rota GET', async () => {
    mailerMocks.sendMail.mockRejectedValueOnce(new Error('smtp token=segredo'));

    const response = await request(app).get('/test-email?to=destino@teste.com');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Falha ao enviar email');
    expect(response.text.toLowerCase()).not.toContain('token');
  });
});

afterEach(() => {
  process.env.MAIL_FROM = mailFromOriginal;
  process.env.NODE_ENV = nodeEnvOriginal;
});
