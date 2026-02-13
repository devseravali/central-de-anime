export type Sessao = {
  id: number;
  usuarioId: number;
  token: string;
  expiraEm: Date;
  criadoEm?: Date;
};

export type CriarSessaoInput = {
  usuarioId: number;
  token: string;
  expiraEm: Date;
};