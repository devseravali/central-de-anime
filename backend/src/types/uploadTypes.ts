export interface CapaUpload {
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho: number;
  usuarioId: number | null;
  dataUpload: Date;
}

export interface PersonagemUpload {
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho: number;
  usuarioId: number | null;
  dataUpload: Date;
}
