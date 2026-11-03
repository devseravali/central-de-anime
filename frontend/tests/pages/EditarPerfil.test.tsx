// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditarPerfil } from '../../src/pages/EditarPerfil/EditarPerfil';
import { personagemService } from '../../src/services/personagem.service';
import {
  userService,
  type UsuarioProfileResponse,
} from '../../src/services/user.service';
import { httpResponse, profile } from '../fixtures/userData';
import { renderApp } from '../fixtures/renderApp';
import { createDeferred } from '../hooks/deferred';

vi.mock('../../src/services/user.service', () => ({
  userService: { buscarMeuPerfil: vi.fn(), atualizarMeuPerfil: vi.fn() },
}));
vi.mock('../../src/services/personagem.service', () => ({
  personagemService: { listarPersonagens: vi.fn() },
}));

const loaded = () => screen.findByText('Selecione abaixo sua nova foto.');
const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'sessao-ficticia');
  vi.mocked(userService.buscarMeuPerfil)
    .mockReset()
    .mockResolvedValue(profile());
  vi.mocked(userService.atualizarMeuPerfil)
    .mockReset()
    .mockResolvedValue(profile());
  vi.mocked(personagemService.listarPersonagens)
    .mockReset()
    .mockResolvedValue([
      { id: 12, nome: 'Akira', imagem: 'https://cdn.example.test/akira.jpg' },
      { id: 13, nome: 'Yumi', imagem: 'https://cdn.example.test/yumi.jpg' },
      { id: 14, nome: 'Sem imagem' },
    ]);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('EditarPerfil', () => {
  it('carrega campos, filtra opções válidas e atualiza prévia e seleção do avatar', async () => {
    const request = createDeferred<UsuarioProfileResponse>();
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    renderApp(<EditarPerfil />);
    expect(screen.getByText('Carregando personagens...')).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'Salvar perfil' })
        .hasAttribute('disabled'),
    ).toBe(true);
    await act(async () => request.resolve(profile()));
    await loaded();
    expect(screen.getByDisplayValue('Pessoa 7')).toBeTruthy();
    expect(screen.getByDisplayValue('pessoa7@example.test')).toBeTruthy();
    expect(screen.getByLabelText('Status atual').hasAttribute('disabled')).toBe(
      true,
    );
    expect(
      screen.queryByRole('button', { name: 'Selecionar avatar de Sem imagem' }),
    ).toBeNull();
    change('Buscar personagem', '  YUMI ');
    expect(
      screen.queryByRole('button', { name: 'Selecionar avatar de Akira' }),
    ).toBeNull();
    const avatar = screen.getByRole('button', {
      name: 'Selecionar avatar de Yumi',
    });
    fireEvent.click(avatar);
    expect(avatar.getAttribute('aria-pressed')).toBe('true');
    expect(
      screen
        .getByRole('img', { name: 'Prévia do avatar selecionado' })
        .getAttribute('src'),
    ).toBe('https://cdn.example.test/yumi.jpg');
    expect(userService.atualizarMeuPerfil).not.toHaveBeenCalled();
  });

  it.each([
    ['curta', 'curta', 'A nova senha deve ter no mínimo 6 caracteres.'],
    ['senha-segura', 'diferente', 'A confirmação de senha não confere.'],
  ])(
    'valida senha antes de salvar: %s / %s',
    async (password, confirmation, message) => {
      renderApp(<EditarPerfil />);
      await loaded();
      change('Nova senha (opcional)', password);
      change('Confirmar nova senha', confirmation);
      fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
      expect(screen.getByText(message)).toBeTruthy();
      expect(userService.atualizarMeuPerfil).not.toHaveBeenCalled();
      expect(
        screen
          .getByRole('button', { name: 'Salvar perfil' })
          .hasAttribute('disabled'),
      ).toBe(false);
    },
  );

  it('salva dados e avatar, bloqueia reenvio e só sincroniza armazenamento e eventos após sucesso', async () => {
    const request = createDeferred<UsuarioProfileResponse>();
    vi.mocked(userService.atualizarMeuPerfil).mockReturnValue(request.promise);
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    renderApp(<EditarPerfil />);
    await loaded();
    change('Nome', '  Novo nome  ');
    change('Email', '  novo@example.test  ');
    change('Nova senha (opcional)', 'nova-segura');
    change('Confirmar nova senha', 'nova-segura');
    fireEvent.click(
      screen.getByRole('button', { name: 'Selecionar avatar de Akira' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Selecionar fundo one piece t1' }),
    );
    const selectedBanner = screen
      .getByRole('img', { name: 'one piece t1' })
      .getAttribute('src');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() =>
      expect(userService.atualizarMeuPerfil).toHaveBeenCalledWith({
        nome: 'Novo nome',
        email: 'novo@example.test',
        senha: 'nova-segura',
        avatar: 'https://cdn.example.test/akira.jpg',
      }),
    );
    const saving = screen.getByRole('button', { name: 'Salvando...' });
    expect(saving.hasAttribute('disabled')).toBe(true);
    fireEvent.click(saving);
    expect(userService.atualizarMeuPerfil).toHaveBeenCalledOnce();
    expect(localStorage.getItem('userAvatar')).toBeNull();
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user-avatar-updated' }),
    );
    await act(async () => request.resolve(profile()));
    expect(
      await screen.findByText('Perfil atualizado com sucesso.'),
    ).toBeTruthy();
    expect(localStorage.getItem('userAvatar')).toBe(
      'https://cdn.example.test/akira.jpg',
    );
    expect(localStorage.getItem('userProfileBanner')).toBe(selectedBanner);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user-avatar-updated' }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user-banner-updated' }),
    );
    expect(screen.getByLabelText('Nova senha (opcional)')).toHaveProperty(
      'value',
      '',
    );
    expect(screen.getByLabelText('Confirmar nova senha')).toHaveProperty(
      'value',
      '',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao perfil' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/perfil');
  });

  it('falha ao salvar mantém campos e não publica avatar nem mensagem de sucesso', async () => {
    vi.mocked(userService.atualizarMeuPerfil).mockRejectedValue(
      new Error('Não foi possível salvar.'),
    );
    renderApp(<EditarPerfil />);
    await loaded();
    change('Nome', 'Nome preservado');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(await screen.findByText('Não foi possível salvar.')).toBeTruthy();
    expect(screen.getByDisplayValue('Nome preservado')).toBeTruthy();
    expect(localStorage.getItem('userAvatar')).toBeNull();
    expect(localStorage.getItem('userProfileBanner')).toBeNull();
    expect(screen.queryByText('Perfil atualizado com sucesso.')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Salvar perfil' })
        .hasAttribute('disabled'),
    ).toBe(false);
  });

  it('falha das opções de avatar não apaga os dados básicos carregados', async () => {
    vi.mocked(personagemService.listarPersonagens).mockRejectedValue(
      new Error('Falha nos personagens'),
    );
    renderApp(<EditarPerfil />);
    expect(
      await screen.findByText(
        'Não foi possível carregar as fotos dos personagens.',
      ),
    ).toBeTruthy();
    expect(screen.getByDisplayValue('Pessoa 7')).toBeTruthy();
    expect(screen.getByDisplayValue('pessoa7@example.test')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /Selecionar avatar de/ }),
    ).toBeNull();
  });

  it('falha no perfil não preenche dados privados mas preserva opções públicas de avatar', async () => {
    vi.mocked(userService.buscarMeuPerfil).mockRejectedValue(
      new Error('Detalhe interno da sessão'),
    );
    renderApp(<EditarPerfil />);
    expect(
      await screen.findByText('Sessão inválida. Faça login novamente.'),
    ).toBeTruthy();
    expect(screen.queryByDisplayValue('pessoa7@example.test')).toBeNull();
    expect(screen.queryByText('Detalhe interno da sessão')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Selecionar avatar de Akira' }),
    ).toBeTruthy();
    expect(userService.atualizarMeuPerfil).not.toHaveBeenCalled();
  });

  it('sem autenticação não consulta o perfil privado nem permite salvamento', async () => {
    localStorage.clear();
    renderApp(<EditarPerfil />);
    expect(
      await screen.findByText('Sessão não encontrada. Faça login novamente.'),
    ).toBeTruthy();
    expect(userService.buscarMeuPerfil).not.toHaveBeenCalled();
    expect(screen.queryByDisplayValue('pessoa7@example.test')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(userService.atualizarMeuPerfil).not.toHaveBeenCalled();
    expect(screen.queryByText('Perfil atualizado com sucesso.')).toBeNull();
  });

  it('sessão expirada ao salvar apresenta erro de sessão sem a mensagem interna', async () => {
    const response = httpResponse({
      message: 'token interno expirado: detalhe privado',
    });
    response.status = 401;
    vi.mocked(userService.atualizarMeuPerfil).mockRejectedValue(
      new AxiosError('Falha', undefined, response.config, undefined, response),
    );
    renderApp(<EditarPerfil />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(
      await screen.findByText('Sessão inválida. Faça login novamente.'),
    ).toBeTruthy();
    expect(screen.queryByText(/detalhe privado/)).toBeNull();
    expect(localStorage.getItem('userAvatar')).toBeNull();
  });
});
