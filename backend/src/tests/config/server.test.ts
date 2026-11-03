import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listen: vi.fn(),
}));

vi.mock('dotenv/config', () => ({}));
vi.mock('../../app', () => ({
  default: { listen: mocks.listen },
}));

describe('Configuracao: porta do servidor', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa a porta fornecida pelo ambiente do Render', async () => {
    vi.stubEnv('PORT', '10000');

    await import('../../server');

    expect(mocks.listen).toHaveBeenCalledWith(10000, expect.any(Function));
  });

  it('mantem a porta local como fallback quando PORT esta ausente', async () => {
    vi.stubEnv('PORT', undefined);

    await import('../../server');

    expect(mocks.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
