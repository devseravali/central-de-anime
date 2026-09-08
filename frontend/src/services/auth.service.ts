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

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);

    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);

    return response.data;
  },

  refresh: async (data?: RefreshData) => {
    const response = await api.post('/auth/refresh', data);

    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });

    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post('/auth/reset-password', data);

    return response.data;
  },

  logout: async (data?: LogoutData) => {
    const response = await api.post('/auth/logout', data);

    return response.data;
  },
};