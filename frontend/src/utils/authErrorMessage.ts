import { isAxiosError } from 'axios';

type AuthErrorContext = 'login' | 'register' | 'emailVerification';

const ERROR_MESSAGES: Record<AuthErrorContext, string> = {
  login: 'Não foi possível entrar. Verifique seus dados e tente novamente.',
  register: 'Não foi possível criar sua conta. Tente novamente.',
  emailVerification: 'Não foi possível confirmar seu email. Tente novamente.',
};

const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';

export const getSafeAuthErrorMessage = (
  error: unknown,
  context: AuthErrorContext,
): string => {
  if (isAxiosError(error) && error.code === 'ERR_NETWORK') {
    return NETWORK_ERROR_MESSAGE;
  }

  return ERROR_MESSAGES[context];
};
