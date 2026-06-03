export interface CriarVerificacaoEmailDTO {
  usuarioId: number;
  token: string;
  expiraEm: Date;
  valor: string;
}
