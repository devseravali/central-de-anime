import { api } from './api';

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface RefreshData {
  refreshToken?: string;
}

export interface ResetPasswordData {
  token: string;
  novaSenha: string;
}

export interface LogoutData {
  refreshToken?: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  avatar?: string | null;
  status?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshExpiraEm: string;
}

export interface RefreshResponse {
  accessToken: string;
  user: AuthUser;
  refreshExpiraEm: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordResponse extends LoginResponse {
  message: string;
}

export interface AuthMessageResponse {
  message: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthUser> => {
    const response = await api.post<AuthUser>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (data?: RefreshData): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>('/auth/refresh', data, {
      withCredentials: true,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);

    return response.data;
  },

  logout: async (data?: LogoutData): Promise<AuthMessageResponse> => {
    const response = await api.post<AuthMessageResponse>('/auth/logout', data, {
      withCredentials: true,
    });
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData): Promise<AuthMessageResponse> => {
    const response = await api.post<AuthMessageResponse>('/auth/verify-email', data);
    return response.data;
  },
};