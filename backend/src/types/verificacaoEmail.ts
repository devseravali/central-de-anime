
export interface VerificacaoEmail {
  id: number;
  usuarioId: number;
  token: string;
  expiraEm: Date;
  usadoEm: Date | null;
  criadoEm: Date;
}

export interface CriarVerificacaoEmailDTO {
  usuarioId: number;
  token: string;
  expiraEm: Date;
}


export interface VerificacaoEmailResultado {
  usuarioId: number;
}
