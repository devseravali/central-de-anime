// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthForm } from '../../src/components/auth/AuthForm/AuthForm';
import { ConfirmarEmail } from '../../src/pages/ConfirmarEmail/ConfirmarEmail';
import { EsqueciSenha } from '../../src/pages/EsqueciSenha/EsqueciSenha';
import { ResetPassword } from '../../src/pages/ResetPassword/ResetPassword';
import { authService } from '../../src/services/auth.service';
import { setAccessToken } from '../../src/services/api';
import { createDeferred } from '../hooks/deferred';
import { renderAppWithQueryClient } from '../fixtures/renderApp';

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock('../../src/services/api', () => ({
  setAccessToken: vi.fn(),
  clearAuthSession: vi.fn(),
  getAccessToken: vi.fn(() => ''),
  subscribeToAuthSessionChanges: vi.fn(() => () => {}),
}));

const login = vi.mocked(authService.login);
const register = vi.mocked(authService.register);
const forgotPassword = vi.mocked(authService.forgotPassword);
const resetPassword = vi.mocked(authService.resetPassword);
const verifyEmail = vi.mocked(authService.verifyEmail);
const setToken = vi.mocked(setAccessToken);

describe('frontend authentication flows', () => {
  beforeEach(() => {
    login.mockReset();
    register.mockReset();
    forgotPassword.mockReset();
    resetPassword.mockReset();
    verifyEmail.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('permite mostrar e ocultar a senha sem perder o valor digitado', () => {
    renderAppWithQueryClient(<AuthForm mode="login" />);
    const password = screen.getByPlaceholderText('Digite sua senha');
    fireEvent.change(password, { target: { value: 'senha-ficticia' } });
    expect(password.getAttribute('type')).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(password.getAttribute('type')).toBe('text');
    expect(password).toHaveProperty('value', 'senha-ficticia');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(password.getAttribute('type')).toBe('password');
    expect(login).not.toHaveBeenCalled();
  });

  it('navega do login para recuperação e oferece link de cadastro', () => {
    renderAppWithQueryClient(<AuthForm mode="login" />);
    expect(screen.getByRole('link', { name: 'Cadastre-se gratuitamente' }).getAttribute('href'))
      .toBe('/registro');
    fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/esqueci-minha-senha');
  });

  it('bloqueia cadastro com confirmação divergente sem chamar o serviço', () => {
    renderAppWithQueryClient(<AuthForm mode="registro" />);
    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Pessoa' } });
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), { target: { value: 'pessoa@example.test' } });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), { target: { value: 'senha-segura' } });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), { target: { value: 'outra-senha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta na Central' }));
    expect(screen.getByText('As senhas não conferem.')).toBeTruthy();
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Entre agora' }).getAttribute('href')).toBe('/login');
  });

  it('bloqueia controles durante cadastro e apresenta erro seguro sem apagar os campos', async () => {
    const request = createDeferred<Awaited<ReturnType<typeof authService.register>>>();
    register.mockReturnValue(request.promise);
    renderAppWithQueryClient(<AuthForm mode="registro" />);
    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Pessoa' } });
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), { target: { value: 'pessoa@example.test' } });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), { target: { value: 'senha-segura' } });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), { target: { value: 'senha-segura' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta na Central' }));
    await waitFor(() => expect(register).toHaveBeenCalledOnce());
    const pending = screen.getByRole('button', { name: 'Enviando...' });
    expect(pending.hasAttribute('disabled')).toBe(true);
    expect(screen.getByPlaceholderText('Seu nome').hasAttribute('disabled')).toBe(true);
    fireEvent.click(pending);
    expect(register).toHaveBeenCalledOnce();
    await act(async () => request.reject(new Error('database connection: detalhe privado')));
    expect(await screen.findByText('Não foi possível criar sua conta. Tente novamente.')).toBeTruthy();
    expect(screen.queryByText(/database connection/)).toBeNull();
    expect(screen.getByPlaceholderText('Seu nome')).toHaveProperty('value', 'Pessoa');
    expect(screen.getByRole('button', { name: 'Criar conta na Central' }).hasAttribute('disabled')).toBe(false);
    expect(setToken).not.toHaveBeenCalled();
  });

  it('valida campos de login antes de chamar o serviço', () => {
    renderAppWithQueryClient(<AuthForm mode="login" />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar na Central' }));

    expect(screen.getByText('Email é obrigatório.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('submete login válido, mantém loading e salva o token ao concluir', async () => {
    const request = createDeferred<{
      user: { id: number; nome: string; email: string };
      accessToken: string;
      refreshExpiraEm: string;
    }>();
    login.mockReturnValue(request.promise);
    localStorage.setItem('rememberCredentials', 'true');
    localStorage.setItem('rememberedPassword', 'senha-antiga');

    renderAppWithQueryClient(<AuthForm mode="login" />);
    const email = screen.getByPlaceholderText('seu.email@exemplo.com');
    const password = screen.getByPlaceholderText('Digite sua senha');
    fireEvent.change(email, { target: { value: 'pessoa@example.test' } });
    fireEvent.change(password, { target: { value: 'senha-correta' } });
    fireEvent.submit(email.closest('form')!);

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: 'pessoa@example.test',
        senha: 'senha-correta',
      }),
    );
    expect(screen.getByRole('button', { name: 'Enviando...' }).hasAttribute('disabled'))
      .toBe(true);

    request.resolve({
      user: { id: 1, nome: 'Pessoa', email: 'pessoa@example.test' },
      accessToken: 'access-token',
      refreshExpiraEm: '2026-10-30T00:00:00.000Z',
    });

    await waitFor(() =>
      expect(screen.getByTestId('current-path').textContent).toBe('/explorar'),
    );
    expect(setToken).toHaveBeenCalledWith('access-token');
    expect(localStorage.getItem('rememberCredentials')).toBe('true');
    expect(localStorage.getItem('rememberedEmail')).toBe(
      'pessoa@example.test',
    );
    expect(localStorage.getItem('rememberedPassword')).toBeNull();
  });

  it('mostra mensagem segura após erro de login sem revelar resposta interna', async () => {
    login.mockRejectedValue(new Error('database connection: secret details'));

    renderAppWithQueryClient(<AuthForm mode="login" />);
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), {
      target: { value: 'pessoa@example.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
      target: { value: 'senha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na Central' }));

    expect(
      await screen.findByText(
        'Não foi possível entrar. Verifique seus dados e tente novamente.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/database connection/)).toBeNull();
    expect(setToken).not.toHaveBeenCalled();
  });

  it('valida cadastro e submete campos válidos ao serviço de registro', async () => {
    register.mockResolvedValue({
      id: 4,
      nome: 'Pessoa',
      email: 'pessoa@example.test',
    });

    renderAppWithQueryClient(<AuthForm mode="registro" />);
    const submit = screen.getByRole('button', {
      name: 'Criar conta na Central',
    });
    fireEvent.click(submit);
    expect(screen.getByText('Nome é obrigatório.')).toBeTruthy();
    expect(register).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'Pessoa' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), {
      target: { value: 'pessoa@example.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
      target: { value: 'abc' },
    });
    fireEvent.click(submit);
    expect(
      screen.getByText('A senha deve ter pelo menos 6 caracteres.'),
    ).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
      target: { value: 'senha-segura' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), {
      target: { value: 'senha-segura' },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        nome: 'Pessoa',
        email: 'pessoa@example.test',
        senha: 'senha-segura',
      }),
    );
    expect(
      await screen.findByText(
        'Conta criada. Enviamos um link de confirmação para o seu email.',
      ),
    ).toBeTruthy();
    expect(setToken).not.toHaveBeenCalled();
  });

  it('recupera senha com resposta genérica independente da existência da conta', async () => {
    const request = createDeferred<{ message: string }>();
    forgotPassword.mockReturnValue(request.promise);

    renderAppWithQueryClient(<EsqueciSenha />);
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), {
      target: { value: 'pessoa@example.test' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('seu.email@exemplo.com').closest('form')!,
    );

    await waitFor(() => expect(forgotPassword).toHaveBeenCalledOnce());
    expect(forgotPassword.mock.calls[0][0]).toBe('pessoa@example.test');
    expect(screen.getByRole('button', { name: 'Enviando...' }).hasAttribute('disabled'))
      .toBe(true);

    request.resolve({ message: 'Conta não encontrada.' });
    expect(
      await screen.findByText(
        'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Conta não encontrada.')).toBeNull();
  });

  it('usa erro genérico de recuperação mesmo quando o backend retorna detalhe sensível', async () => {
    forgotPassword.mockRejectedValue(new Error('email cadastrado: true'));

    renderAppWithQueryClient(<EsqueciSenha />);
    fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), {
      target: { value: 'pessoa@example.test' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('seu.email@exemplo.com').closest('form')!,
    );

    expect(
      await screen.findByText(
        'Não foi possível processar sua solicitação. Tente novamente.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/cadastrado/)).toBeNull();
  });

  it('valida nova senha e envia token e senha somente quando os campos conferem', async () => {
    resetPassword.mockResolvedValue({
      message: 'Senha redefinida.',
      user: { id: 1, nome: 'Pessoa', email: 'pessoa@example.test' },
      accessToken: 'token',
      refreshExpiraEm: '2026-10-30T00:00:00.000Z',
    });

    renderAppWithQueryClient(
      <ResetPassword />,
      '/reset-password?token= reset-token ',
    );
    const submit = screen.getByRole('button', { name: 'Redefinir senha' });
    fireEvent.click(submit);
    expect(screen.getByText('Informe sua nova senha.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'segura123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'diferente' },
    });
    fireEvent.click(submit);
    expect(screen.getByText('As senhas não conferem.')).toBeTruthy();
    expect(resetPassword).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'segura123' },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'reset-token',
        novaSenha: 'segura123',
      }),
    );
    expect(
      await screen.findByText(
        'Senha redefinida com sucesso. Agora você já pode entrar.',
      ),
    ).toBeTruthy();
    expect(setToken).not.toHaveBeenCalled();
  });

  it('não revela detalhes do backend quando a redefinição falha', async () => {
    resetPassword.mockRejectedValue(new Error('token inválido: account 42'));

    renderAppWithQueryClient(<ResetPassword />, '/reset-password?token=reset-token');
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'senha-segura' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'senha-segura' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    expect(
      await screen.findByText(
        'Não foi possível redefinir sua senha. Tente novamente.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/account 42/)).toBeNull();
  });

  it('confirma uma vez o token da URL e mostra sucesso ou erro genérico', async () => {
    verifyEmail.mockResolvedValue({ message: 'Confirmação concluída.' });

    renderAppWithQueryClient(
      <ConfirmarEmail />,
      '/confirmar-email?token=%20email-token%20',
    );

    await waitFor(() =>
      expect(verifyEmail).toHaveBeenCalledOnce(),
    );
    expect(verifyEmail).toHaveBeenCalledWith({ token: 'email-token' });
    expect(
      await screen.findByText(
        'Email confirmado com sucesso. Sua conta já está ativa.',
      ),
    ).toBeTruthy();
  });

  it('não chama confirmação sem token e oculta erro interno ao confirmar email', async () => {
    const { unmount } = renderAppWithQueryClient(
      <ConfirmarEmail />,
      '/confirmar-email',
    );
    expect(
      screen.getByText(/Token de confirmação ausente/),
    ).toBeTruthy();
    expect(verifyEmail).not.toHaveBeenCalled();
    unmount();

    verifyEmail.mockRejectedValue(new Error('private service stack'));
    renderAppWithQueryClient(
      <ConfirmarEmail />,
      '/confirmar-email?token=token-invalido',
    );

    expect(
      await screen.findByText(
        'Não foi possível confirmar seu email. Tente novamente.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/private service stack/)).toBeNull();
  });
});
