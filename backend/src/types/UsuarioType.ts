export type UsuarioType = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  avatar?: string;
  status: string;
  criadoEm: Date;
  atualizadoEm: Date;

  adminId?: number;
  sessoes?: number[];
  favoritos?: number[];
  notas?: number[];
  personagensFav?: number[];
  watchProgress?: number[];
  rankingId?: number;
};