export interface CriarVerificacaoEmailDTO {
  usuarioId: number;
  valor: string;
  expiraEm: Date;
}

export type VerificacaoEmail = {
  id: number;
  usuarioId: number;
  valor: string;
  criadoEm: Date;
  tipo: string;
  expiraEm: Date | null;
  usadoEm?: Date | null;
};

export type VerificacaoEmailResultado = {
  usuarioId: number;
};
