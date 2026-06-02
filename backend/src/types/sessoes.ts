export interface CriarSessaoInput {
  usuarioId: number;
  refreshTokenHash: string;
  dispositivo?: string;
  ip?: string;
  userAgent?: string;
  expiraEm: Date;
}

export interface Sessao {
  id: number;
  usuarioId: number;
  refreshTokenHash: string;
  dispositivo?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  expiraEm: Date;
  revogadoEm?: Date | null;
}
