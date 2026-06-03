export interface SalvarCapaDTO {
  usuarioId: number | null;
  animeId: number;
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho?: number;
}
