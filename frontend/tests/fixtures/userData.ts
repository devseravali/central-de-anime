import { AxiosHeaders, type AxiosResponse } from 'axios';
import type { FavoritoAnime } from '../../src/services/favorito.service';
import type { ProgressoEpisodio } from '../../src/services/progresso.service';
import type { UsuarioProfileResponse } from '../../src/services/user.service';
import type { AnimeData } from '../../src/types/AnimeData';
import type { Episodio } from '../../src/types/Episodio';

export const profile = (id = 7): UsuarioProfileResponse => ({
  message: 'Perfil carregado',
  usuario: {
    id,
    nome: `Pessoa ${id}`,
    email: `pessoa${id}@example.test`,
    avatar: '/avatars/original.jpg',
    status: 'ativo',
  },
});

export const anime: AnimeData = {
  id: 10,
  titulo: 'Anime de teste',
  tipo: 'TV',
  temporada: 1,
  ano: 2026,
  quantidadeEpisodios: 2,
  statusId: 1,
  estacao: 'Outono',
  sinopse: 'Sinopse ficticia.',
  capaUrl: '/capas/teste.jpg',
};

export const favoriteAnime: FavoritoAnime = {
  id: anime.id,
  titulo: anime.titulo,
  tipo: anime.tipo,
  temporada: 1,
  ano: 2026,
  quantidadeEpisodios: 2,
  sinopse: null,
  capaUrl: null,
  estudio: null,
  status: null,
};

export const episodes: Episodio[] = [
  { id: 102, animeId: 10, numero: 2, titulo: 'Segundo' },
  { id: 101, animeId: 10, numero: 1, titulo: 'Primeiro' },
];

export const progress = (
  episodioId = 101,
  assistido = true,
): ProgressoEpisodio => ({
  usuarioId: 7,
  episodioId,
  segundosAssistidos: assistido ? 1200 : 0,
  porcentagem: assistido ? 100 : 0,
  assistido,
  atualizadoEm: '2026-10-29T12:00:00.000Z',
  episodio: { anime: { id: anime.id, titulo: anime.titulo } },
});

export const httpResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});
