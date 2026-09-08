import { api } from './api';

export const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const refresh = async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};