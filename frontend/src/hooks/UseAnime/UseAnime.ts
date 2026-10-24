import { useInfiniteQuery } from '@tanstack/react-query';

import { animeService } from '../../services/anime.service';

const PAGE_SIZE = 20;

export const useAnimes = (busca: string) => {
  const buscaNormalizada = busca.trim();
  const isSearching = buscaNormalizada.length > 0;

  return useInfiniteQuery({
    queryKey: ['animes', buscaNormalizada],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      if (isSearching) {
        return animeService.buscarAnimes(buscaNormalizada, {
          page: pageParam,
          perPage: PAGE_SIZE,
        });
      }

      return animeService.listarAnimes({
        page: pageParam,
        perPage: PAGE_SIZE,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.items.length,
        0,
      );

      if (loadedCount >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
  });
};