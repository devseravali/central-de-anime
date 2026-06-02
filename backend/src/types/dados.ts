export interface BuscaPorNomeResultado {
  estacoes?: Array<{ id: number; nome: string }>;
  status?: Array<{ id: number; nome: string }>;
  estudios?: Array<{ id: number; nome: string }>;
  generos?: Array<{ id: number; nome: string }>;
  plataformas?: Array<{ id: number; nome: string }>;
  tags?: Array<{ id: number; nome: string }>;
  animes?: Array<{ id: number; titulo: string }>;
  personagens?: Array<{ id: number; nome: string }>;
}
