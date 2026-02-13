export type StatusUsuario = 'ativo' | 'pendente' | 'suspenso' | 'banido';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  status?: StatusUsuario | null;
  emailVerificado?: boolean | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  criadoEm?: Date | null;
  atualizadoEm?: Date | null;
};

export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

export type CriarUsuarioDTO = {
  nome: string;
  email: string;
  senha: string;
};

export type AtualizarUsuarioDTO = {
  nome?: string;
  email?: string;
};

export type LoginDTO = {
  email: string;
  senha: string;
};

export type TokenResponse = {
  token: string;
};