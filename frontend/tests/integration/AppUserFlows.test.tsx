// @vitest-environment jsdom

import React from 'react';
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/layout/Header/Header';
import { Home } from '../../src/pages/Home/Home';
import { Explorar } from '../../src/pages/Explorar/Explorar';
import { DetalhesAnime } from '../../src/pages/DetalhesAnime/DetalhesAnime';
import { Favoritos } from '../../src/pages/Favoritos/Favoritos';
import { Perfil } from '../../src/pages/Perfil/Perfil';
import { EditarPerfil } from '../../src/pages/EditarPerfil/EditarPerfil';
import { MeuProgresso } from '../../src/pages/MeuProgresso/MeuProgresso';
import { Login } from '../../src/pages/Login/Login';
import { Registro } from '../../src/pages/Registro/Registro';
import { renderAppWithQueryClient } from '../fixtures/renderApp';

type FlowAnime = {
  id: number;
  titulo: string;
  tipo: string;
  quantidadeEpisodios: number;
  ano: number;
  sinopse: string;
  capaUrl: string | null;
};

const flowState = vi.hoisted(() => ({
  catalog: [] as FlowAnime[],
  favoriteIds: new Set<number>(),
  profile: {
    id: 7,
    nome: 'Pessoa 7',
    email: 'pessoa7@example.test',
    avatar: '/avatars/original.jpg',
    status: 'ativo',
  },
  progressByAnime: new Map<number, { watched: number; total: number }>(),
}));

const resetFlowState = () => {
  flowState.catalog = [
    {
      id: 10,
      titulo: 'Ninja Eclipse',
      tipo: 'TV',
      quantidadeEpisodios: 12,
      ano: 2026,
      sinopse: 'Uma jornada em busca de equilíbrio.',
      capaUrl: '/capas/ninja.jpg',
    },
    {
      id: 11,
      titulo: 'Samurai Aurora',
      tipo: 'TV',
      quantidadeEpisodios: 24,
      ano: 2025,
      sinopse: 'Uma guerra entre clãs antigos.',
      capaUrl: '/capas/samurai.jpg',
    },
  ];
  flowState.favoriteIds = new Set<number>();
  flowState.profile = {
    id: 7,
    nome: 'Pessoa 7',
    email: 'pessoa7@example.test',
    avatar: '/avatars/original.jpg',
    status: 'ativo',
  };
  flowState.progressByAnime = new Map<
    number,
    { watched: number; total: number }
  >([[10, { watched: 3, total: 12 }]]);
};

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(async () => ({
      user: { id: 7, nome: 'Pessoa 7', email: 'pessoa7@example.test' },
      accessToken: 'token-sessao',
      refreshExpiraEm: '2026-10-30T00:00:00.000Z',
    })),
    logout: vi.fn(async () => ({ message: 'Logout efetuado.' })),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock('../../src/services/anime.service', () => ({
  animeService: {
    listarAnimes: vi.fn(),
    buscarAnimes: vi.fn(),
    buscarAnime: vi.fn(async (animeId: number) => {
      const anime = flowState.catalog.find((item) => item.id === animeId);

      if (!anime) {
        throw new Error('Anime não encontrado');
      }

      return {
        ...anime,
        temporada: 1,
        estacao: 'Outono',
        status: 'Em exibição',
        generos: ['Ação'],
        estudio: 'Studio Aurora',
      };
    }),
  },
}));

vi.mock('../../src/services/temporada.service', () => ({
  temporadaService: {
    listarTemporadas: vi.fn(),
    buscarTemporada: vi.fn(),
    listarTemporadasPorAnime: vi.fn(async (animeId: number) => {
      const anime = flowState.catalog.find((item) => item.id === animeId);
      if (!anime) {
        return [];
      }

      return [
        {
          id: anime.id * 100,
          animeId: anime.id,
          numero: 1,
          quantidadeEpisodios: 1,
          episodios: [
            {
              id: anime.id * 1000,
              animeId: anime.id,
              numero: 1,
              titulo: `Episódio 1 de ${anime.titulo}`,
              imagemUrl: '/episodios/capa.jpg',
              sinopse: 'Introdução da temporada.',
            },
          ],
        },
      ];
    }),
  },
}));

vi.mock('../../src/services/favorito.service', () => ({
  favoritoService: {
    Favoritar: vi.fn(async (animeId: number) => {
      flowState.favoriteIds.add(animeId);
    }),
    Desfavoritar: vi.fn(async (animeId: number) => {
      flowState.favoriteIds.delete(animeId);
    }),
    FavoritarPersonagem: vi.fn(),
    DesfavoritarPersonagem: vi.fn(),
    AnimesFavoritos: vi.fn(async () =>
      flowState.catalog
        .filter((anime) => flowState.favoriteIds.has(anime.id))
        .map((anime) => ({
          id: anime.id,
          titulo: anime.titulo,
          tipo: anime.tipo,
          temporada: 1,
          ano: anime.ano,
          sinopse: anime.sinopse,
          capaUrl: anime.capaUrl,
          quantidadeEpisodios: anime.quantidadeEpisodios,
          estudio: null,
          status: null,
        })),
    ),
    PersonagensFavoritos: vi.fn(async () => []),
  },
}));

vi.mock('../../src/services/user.service', () => ({
  userService: {
    buscarMeuPerfil: vi.fn(async () => ({
      message: 'Perfil carregado',
      usuario: {
        ...flowState.profile,
        avatar: localStorage.getItem('userAvatar') || flowState.profile.avatar,
      },
    })),
    atualizarMeuPerfil: vi.fn(
      async (payload: {
        nome?: string;
        email?: string;
        avatar?: string | null;
      }) => {
        flowState.profile = {
          ...flowState.profile,
          nome: payload.nome ?? flowState.profile.nome,
          email: payload.email ?? flowState.profile.email,
          avatar:
            typeof payload.avatar === 'string'
              ? payload.avatar
              : payload.avatar === null
                ? null
                : flowState.profile.avatar,
        };
        return {
          message: 'Perfil atualizado',
          usuario: { ...flowState.profile },
        };
      },
    ),
  },
}));

vi.mock('../../src/services/personagem.service', () => ({
  personagemService: {
    listarPersonagens: vi.fn(async (animeId?: number | string) => {
      if (animeId !== undefined) {
        return [{ id: 12, nome: 'Akira', imagem: '/avatars/akira.jpg' }];
      }

      return [
        { id: 12, nome: 'Akira', imagem: 'https://cdn.example.test/akira.jpg' },
        { id: 13, nome: 'Yumi', imagem: 'https://cdn.example.test/yumi.jpg' },
      ];
    }),
    listarPersonagensPorId: vi.fn(),
    listarPersonagensPorUrl: vi.fn(),
    buscarPersonagemPorUrl: vi.fn(),
  },
}));

vi.mock('../../src/hooks/UseHomeData/useHomeData', () => ({
  useHomeData: vi.fn(() => ({
    animes: flowState.catalog,
    totalAnimes: flowState.catalog.length,
    personagens: [{ id: 12, nome: 'Akira', imagem: '/avatars/akira.jpg' }],
    loading: false,
    loadingPersonagens: false,
    error: false,
    personagemError: false,
  })),
}));

vi.mock('../../src/hooks/UseAnime/UseAnime', () => ({
  useAnimes: vi.fn((busca: string) => {
    const normalized = busca.trim().toLowerCase();
    const source =
      normalized.length === 0
        ? flowState.catalog
        : flowState.catalog.filter((anime) =>
            anime.titulo.toLowerCase().includes(normalized),
          );

    const items = source.map((anime) => ({
      ...anime,
      temporada: 1,
      estacao: 'Outono',
      statusId: 1,
      estacaoId: 3,
      estudioId: 1,
    }));

    const isFailureState = normalized === 'instavel';
    const effectiveItems =
      isFailureState && items.length === 0
        ? [
            {
              ...flowState.catalog[0],
              temporada: 1,
              estacao: 'Outono',
              statusId: 1,
              estacaoId: 3,
              estudioId: 1,
            },
          ]
        : items;

    return {
      data: {
        pages: [
          {
            items: effectiveItems,
            page: 1,
            perPage: 20,
            total: effectiveItems.length,
          },
        ],
      },
      isLoading: false,
      error: isFailureState ? new Error('Falha durante atualização') : null,
      isFetchNextPageError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isRefetching: false,
      isFetchingNextPage: false,
      refetch: vi.fn(async () => ({})),
    };
  }),
}));

vi.mock('../../src/hooks/UseFavoriteData/useFavoriteData', () => ({
  useFavoriteData: vi.fn(() => {
    const [, forceRender] = React.useState(0);
    const animeFavorites = flowState.catalog
      .filter((anime) => flowState.favoriteIds.has(anime.id))
      .map((anime) => ({
        id: anime.id,
        titulo: anime.titulo,
        tipo: anime.tipo,
        temporada: 1,
        ano: anime.ano,
        sinopse: anime.sinopse,
        capaUrl: anime.capaUrl,
        quantidadeEpisodios: anime.quantidadeEpisodios,
        estudio: null,
        status: null,
      }));

    return {
      actionError: null,
      animeFavorites,
      auxiliaryError: null,
      characterFavorites: [],
      episodeCounts: Object.fromEntries(
        flowState.catalog.map((anime) => [anime.id, anime.quantidadeEpisodios]),
      ),
      episodesLoading: false,
      error: null,
      loading: false,
      removeFavorite: async (item: { id: number }) => {
        flowState.favoriteIds.delete(item.id);
        forceRender((current) => current + 1);
      },
      removingKey: null,
      retry: vi.fn(),
      sessionAvailable: Boolean(localStorage.getItem('accessToken')),
      userId: localStorage.getItem('accessToken') ? flowState.profile.id : null,
    };
  }),
}));

vi.mock('../../src/hooks/UseFavoriteRatings/useFavoriteRatings', () => ({
  useFavoriteRatings: vi.fn((userId: number | null) => ({
    ratingsByAnime: userId ? { 10: 8.7, 11: 9.1 } : {},
    error: null,
    isLoading: false,
    retry: vi.fn(),
  })),
}));

vi.mock('../../src/hooks/UseProfileData/useProfileData', () => ({
  useProfileData: vi.fn(() => ({
    loading: false,
    errorMessage: null,
    hasPartialData: false,
    nome: flowState.profile.nome,
    email: flowState.profile.email,
    avatar: localStorage.getItem('userAvatar') || flowState.profile.avatar,
    status: flowState.profile.status,
    pontosArquivo: 1500,
    totalFavoritosAnimes: flowState.favoriteIds.size,
    totalFavoritosPersonagens: 0,
    episodiosConcluidos: 4,
    totalProgressos: 6,
    conquistas: [
      {
        id: 'primeiro',
        nome: 'Primeiro marco',
        descricao: 'Concluiu um episódio',
        categoria: 'progresso',
        unlocked: true,
        progress: { current: 1, target: 1, percent: 100 },
      },
    ],
    totalConquistasDesbloqueadas: 1,
  })),
}));

vi.mock('../../src/hooks/UseMeuProgressoData/useMeuProgressoData', () => ({
  useMeuProgressoData: vi.fn(() => {
    const [items, setItems] = React.useState(() =>
      Array.from(flowState.progressByAnime.entries()).map(
        ([animeId, progress]) => {
          const anime = flowState.catalog.find((item) => item.id === animeId);

          return {
            id: animeId,
            titulo: anime?.titulo ?? `Anime ${animeId}`,
            subtitulo: anime?.tipo ?? 'TV',
            temporada: 'Outono',
            totalEpisodios: progress.total,
            episodiosAssistidos: progress.watched,
            status:
              progress.watched >= progress.total ? 'completo' : 'assistindo',
            proximoEpisodio: `Ep. ${Math.min(progress.total, progress.watched + 1)}`,
            ultimaAtualizacao: 'Agora',
            ultimaAtualizacaoOrdem: Date.now(),
            semanaAssistidos: 1,
            sigla: 'AT',
          };
        },
      ),
    );

    const alterItem = async (animeId: number, delta: number) => {
      setItems((current) =>
        current.map((entry) => {
          if (entry.id !== animeId) {
            return entry;
          }

          const nextValue = Math.max(
            0,
            Math.min(entry.totalEpisodios, entry.episodiosAssistidos + delta),
          );

          return {
            ...entry,
            episodiosAssistidos: nextValue,
            status:
              nextValue >= entry.totalEpisodios ? 'completo' : 'assistindo',
          };
        }),
      );
    };

    return {
      actionError: null,
      alterarEpisodio: alterItem,
      dataNotice: null,
      items,
      loadError: false,
      loading: false,
      retry: vi.fn(),
      sessionAvailable: Boolean(localStorage.getItem('accessToken')),
      updatingAnimeId: null,
      weeklyActivity: [5, 10, 20, 30, 40, 55, 70],
    };
  }),
}));

const AppHarness = () => (
  <>
    <Header />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/animes/:id" element={<DetalhesAnime />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/progresso" element={<MeuProgresso />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </main>
  </>
);

const renderApp = (initialEntry: string) =>
  renderAppWithQueryClient(<AppHarness />, initialEntry);

const loginByForm = async () => {
  fireEvent.change(screen.getByPlaceholderText('seu.email@exemplo.com'), {
    target: { value: 'pessoa7@example.test' },
  });
  fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
    target: { value: 'senha-segura' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na Central' }));
  await waitFor(() =>
    expect(screen.getByTestId('current-path').textContent).toBe('/explorar'),
  );
};

const clickAnimeCard = (title: string) => {
  fireEvent.click(screen.getByRole('link', { name: new RegExp(title, 'i') }));
};

describe('App integration flows', () => {
  beforeEach(() => {
    resetFlowState();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('navega Home -> Explorar -> DetalhesAnime e mantém resultado observável', async () => {
    renderApp('/');
    expect(await screen.findByText('Animes em destaque')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Explorar animes' }));
    expect(
      await screen.findByRole('heading', { name: 'Explorar animes' }),
    ).toBeTruthy();
    clickAnimeCard('Ninja Eclipse');
    expect(
      await screen.findByRole('heading', { name: 'Ninja Eclipse' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Adicionar aos favoritos' }),
    ).toBeTruthy();
  });

  it('busca pelo Header, abre resultados e navega para detalhes', async () => {
    renderApp('/');
    await screen.findByText('Animes em destaque');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar animes' }), {
      target: { value: ' ninja ' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(
      await screen.findByRole('heading', { name: 'Resultados para "ninja"' }),
    ).toBeTruthy();
    clickAnimeCard('Ninja Eclipse');
    expect(
      await screen.findByRole('heading', { name: 'Ninja Eclipse' }),
    ).toBeTruthy();
  });

  it('autentica no login, protege favoritos e efetua logout limpando sessão', async () => {
    renderApp('/favoritos');
    expect(await screen.findByText('Conteudo restrito')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Fazer login' }));
    await loginByForm();
    fireEvent.click(screen.getByRole('link', { name: 'Favoritos' }));
    expect(
      await screen.findByRole('heading', { name: 'Meus Favoritos' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() =>
      expect(screen.getByTestId('current-path').textContent).toBe('/login'),
    );
    fireEvent.click(screen.getByRole('link', { name: 'Favoritos' }));
    expect(await screen.findByText('Conteudo restrito')).toBeTruthy();
  });

  it('adiciona e remove favoritos entre DetalhesAnime e página de Favoritos', async () => {
    localStorage.setItem('accessToken', 'sessao-ativa');
    renderApp('/animes/10');
    fireEvent.click(
      await screen.findByRole('button', { name: 'Adicionar aos favoritos' }),
    );
    expect(
      await screen.findByRole('button', { name: 'Remover dos favoritos' }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: 'Favoritos' }));
    expect(
      await screen.findByRole('heading', { name: 'Ninja Eclipse' }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remover Ninja Eclipse dos favoritos',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Ninja Eclipse' }),
      ).toBeNull(),
    );
    expect(screen.getByText('Nenhum favorito encontrado')).toBeTruthy();
  });

  it('carrega perfil, edita dados e sincroniza avatar entre Header e Perfil', async () => {
    localStorage.setItem('accessToken', 'sessao-ativa');
    localStorage.setItem('userAvatar', '/avatars/original.jpg');
    renderApp('/perfil');
    expect(
      await screen.findByRole('heading', { name: 'Pessoa 7' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
    expect(
      await screen.findByRole('heading', { name: 'Editar perfil' }),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Pessoa Atualizada' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Selecionar avatar de Yumi' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(
      await screen.findByText('Perfil atualizado com sucesso.'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao perfil' }));
    expect(
      await screen.findByRole('heading', { name: 'Pessoa Atualizada' }),
    ).toBeTruthy();
    const profileLink = screen.getByRole('link', {
      name: 'Acessar meu perfil',
    });
    const headerAvatar = within(profileLink).getByRole('img', {
      name: 'Avatar do usuário',
    });
    expect(headerAvatar.getAttribute('src')).toBe(
      'https://cdn.example.test/yumi.jpg',
    );
  });

  it('carrega MeuProgresso e atualiza episódios com feedback visual', async () => {
    localStorage.setItem('accessToken', 'sessao-ativa');
    renderApp('/progresso');
    expect(
      await screen.findByRole('heading', { name: 'Meu Progresso de Animes' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('3 de 12 episódios').textContent).toContain(
      '3 / 12',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Aumentar episódios assistidos' }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('4 de 12 episódios').textContent).toContain(
        '4 / 12',
      ),
    );
  });

  it('mantém dados válidos ao navegar com falha de atualização em Explorar', async () => {
    localStorage.setItem('accessToken', 'sessao-ativa');
    renderApp('/explorar?busca=instavel');
    expect(
      await screen.findByText(
        'Não foi possível atualizar os animes. Os resultados carregados continuam disponíveis.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Ninja Eclipse')).toBeTruthy();
    clickAnimeCard('Ninja Eclipse');
    expect(
      await screen.findByRole('heading', { name: 'Ninja Eclipse' }),
    ).toBeTruthy();
  });
});
