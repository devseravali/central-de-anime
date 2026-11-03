import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CurrentPath } from './CurrentPath';
import { AppThemeProvider } from '../../src/providers/themeprovider';

interface AppRenderOptions {
  initialEntry?: string;
  path?: string;
}

export const renderWithAppProviders = (
  element: ReactNode,
  { initialEntry = '/', path, queryClient }: AppRenderOptions & {
    queryClient?: QueryClient;
  } = {},
) => {
  return render(element, {
    wrapper: ({ children }) => {
      const routedContent = path ? (
        <Routes>
          <Route path={path} element={children} />
          {path !== '*' && (
            <Route path="*" element={<p>Destino da navegação</p>} />
          )}
        </Routes>
      ) : (
        children
      );
      const content = (
        <>
          <CurrentPath />
          {routedContent}
        </>
      );

      return (
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppThemeProvider>
            {queryClient ? (
              <QueryClientProvider client={queryClient}>
                {content}
              </QueryClientProvider>
            ) : (
              content
            )}
          </AppThemeProvider>
        </MemoryRouter>
      );
    },
  });
};

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });

export const renderAppWithQueryClient = (
  element: ReactNode,
  initialEntry = '/',
) => {
  const queryClient = createTestQueryClient();
  return {
    ...renderWithAppProviders(element, { initialEntry, queryClient }),
    queryClient,
  };
};

export const renderApp = (
  element: ReactNode,
  { initialEntry = '/', path = '*' }: AppRenderOptions = {},
) => renderWithAppProviders(element, { initialEntry, path });
