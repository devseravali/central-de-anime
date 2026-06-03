export interface SalvarImagemDTO {
  personagemId: number;
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho?: number;
}
