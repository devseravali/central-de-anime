export type EntidadeBuscaDTO =
  | 'generos'
  | 'estudios'
  | 'plataformas'
  | 'status'
  | 'tags'
  | 'animes'
  | 'estacoes'
  | 'personagens';

export interface BuscarPorNomeDTO {
  entidade: EntidadeBuscaDTO;
  nome: string;
}
