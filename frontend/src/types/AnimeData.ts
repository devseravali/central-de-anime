export interface AnimeData {
  id: number;
  titulo: string;
  tipo: string;
  temporada: number;
  ano: number;
  quantidadeEpisodios: number;
  franquiaId?: number;
  franquia?: string;
  estudioId?: number;
  estudio?: string;
  statusId: number;
  status?: string;
  estacaoId?: number;
  estacao?: string;
  sinopse: string;
  capaUrl: string;
  generos?: string[];
}