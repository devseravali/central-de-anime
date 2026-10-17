export interface Episodio {
  id: number;
  titulo: string;
  numero?: number;
  temporada?: number;
  imagemUrl?: string;
  sinopse?: string;
  animeId?: number;
}