import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getSafeAuthErrorMessage } from '../../src/utils/authErrorMessage';

describe('getSafeAuthErrorMessage', () => {
  it('retorna mensagem de rede segura para erro Axios de conexão', () => {
    const error = new AxiosError('internal network detail', 'ERR_NETWORK');

    expect(getSafeAuthErrorMessage(error, 'login')).toBe(
      'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
    );
  });

  it.each([
    ['login', 'Não foi possível entrar. Verifique seus dados e tente novamente.'],
    ['register', 'Não foi possível criar sua conta. Tente novamente.'],
    [
      'emailVerification',
      'Não foi possível confirmar seu email. Tente novamente.',
    ],
  ] as const)(
    'usa mensagem genérica para %s sem expor detalhes do erro',
    (context, expectedMessage) => {
      expect(
        getSafeAuthErrorMessage(
          new Error('database password or token leaked'),
          context,
        ),
      ).toBe(expectedMessage);
    },
  );
});
