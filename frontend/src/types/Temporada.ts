import type { Episodio } from './Episodio';

export interface TemporadaResumo {
  id: number;
  numero: number;
  animeId?: number;
  quantidadeEpisodios: number;
  episodios: Episodio[];
}