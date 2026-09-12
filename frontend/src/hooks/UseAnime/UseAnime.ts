import { useInfiniteQuery } from '@tanstack/react-query';

import { animeService } from '../../services/anime.service';

const PAGE_SIZE = 20;

export const useAnimes = () => {
  return useInfiniteQuery({
    queryKey: ['animes'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      animeService.listarAnimes({
        page: pageParam,
        perPage: PAGE_SIZE,
      }),
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