import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Rotas de Webhooks (/webhooks/engagement)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve processar webhook de engagement e responder com status 204', async () => {
    const res = await request(app)
      .post('/webhooks/engagement')
      .send({ event: 'anime_view', animeId: 1, timestamp: Date.now() });

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
