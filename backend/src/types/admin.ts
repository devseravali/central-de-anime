export interface ConteudoBody {
  tipo: string;
  id: number;
}

export interface UsuarioAdmin {
  id: number;
  avatar: string;
  nome: string;
  email: string;
  senha: string;
  senhaHash: string;
  status: string;
  emailVerificado: boolean;
  admin: boolean;
}
