export interface CapaUpload {
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho: number;
  usuarioId: number | null;
  dataUpload: Date;
}

export interface Capa {
  id: number;
  animeId: number | null;
  usuarioId: number | null;
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho: number;
  dataUpload: Date;
}

export interface PersonagemUpload {
  nomeOriginal: string;
  nomeSalvo: string;
  caminho: string;
  mimetype: string;
  tamanho: number;
  dataUpload: Date;
}
