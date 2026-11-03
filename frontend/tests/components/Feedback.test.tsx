// @vitest-environment jsdom

import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Loading } from '../../src/components/common/Loading/Loading';
import { ErrorMessage } from '../../src/components/common/ErrorMessage/ErrorMessage';
import { renderApp } from '../fixtures/renderApp';

afterEach(cleanup);

describe('Loading', () => {
  it('anuncia o carregamento e substitui o status por alerta quando recebe erro', () => {
    const { rerender } = renderApp(<Loading />);
    expect(screen.getByRole('status', { busy: true }).textContent).toContain(
      'Carregando...',
    );
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(<Loading error="Serviço indisponível" />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar o conteúdo: Serviço indisponível',
    );
    expect(screen.queryByText('Carregando...')).toBeNull();

    rerender(<Loading error={null} />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Carregando...')).toBeTruthy();
  });
});

describe('ErrorMessage', () => {
  it('só exibe a mensagem quando ela existe e acompanha alterações', () => {
    const { rerender } = renderApp(<ErrorMessage />);
    expect(screen.queryByText('Falha ao carregar')).toBeNull();
    rerender(<ErrorMessage message="Falha ao carregar" />);
    expect(screen.getByText('Falha ao carregar')).toBeTruthy();
    rerender(<ErrorMessage message="Tente novamente" />);
    expect(screen.queryByText('Falha ao carregar')).toBeNull();
    expect(screen.getByText('Tente novamente')).toBeTruthy();
    rerender(<ErrorMessage message="" />);
    expect(screen.queryByText('Tente novamente')).toBeNull();
  });
});
