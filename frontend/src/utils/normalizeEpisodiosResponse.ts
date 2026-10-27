import type { Episodio, EpisodiosResponse } from '../types/Episodio';

export const normalizeEpisodiosResponse = (
  response: EpisodiosResponse,
): Episodio[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.items) ? response.items : [];
};
