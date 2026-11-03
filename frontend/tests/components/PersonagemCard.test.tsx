// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PersonagemCard } from '../../src/components/anime/PersonagemCard/PersonagemCard';
import { renderApp } from '../fixtures/renderApp';

afterEach(cleanup);

describe('PersonagemCard', () => {
  it('exibe nome, imagem e papel dos dados e navega pelo ID recebido', () => {
    const onClick = vi.fn();
    renderApp(
      <PersonagemCard
        id={12}
        nome="Nome alternativo"
        imagem="/alternativa.jpg"
        personagem={{
          nome: 'Akira',
          imagem: '/avatars/akira.jpg',
          papel: 'Protagonista',
        }}
        urlBase="https://media.example.test/api/personagens"
        onClick={onClick}
      />,
    );

    expect(screen.getByText('Akira')).toBeTruthy();
    expect(screen.getByText('Protagonista')).toBeTruthy();
    expect(screen.queryByText('Nome alternativo')).toBeNull();
    expect(
      screen.getByRole('img', { name: 'Imagem de Akira' }).getAttribute('src'),
    ).toBe('https://media.example.test/avatars/akira.jpg');
    const link = screen.getByRole('link', { name: 'Ver detalhes de Akira' });
    expect(link.getAttribute('href')).toBe('/personagens/12');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByTestId('current-path').textContent).toBe(
      '/personagens/12',
    );
  });

  it('usa placeholder quando não há imagem e atualiza o conteúdo quando as props mudam', () => {
    const { rerender } = renderApp(<PersonagemCard nome="Sem imagem" />);
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      '/placeholder/personagem.png',
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();

    rerender(
      <PersonagemCard
        nome="Novo nome"
        imagem="https://cdn.example.test/nova.jpg"
      />,
    );
    expect(screen.queryByText('Sem imagem')).toBeNull();
    expect(
      screen
        .getByRole('img', { name: 'Imagem de Novo nome' })
        .getAttribute('src'),
    ).toBe('https://cdn.example.test/nova.jpg');
  });

  it.each(['Enter', ' '])('sem ID, permite ação por teclado com %j', (key) => {
    const onClick = vi.fn();
    renderApp(<PersonagemCard nome="Akira" onClick={onClick} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.keyDown(button, { key });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('sem ID, dispara a ação por clique', () => {
    const onClick = vi.fn();
    renderApp(<PersonagemCard nome="Akira" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
