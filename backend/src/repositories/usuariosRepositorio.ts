import { prisma } from '../lib/prisma';
import type {
  AtualizarUsuarioDTO,
  CriarUsuarioDTO,
  StatusUsuario,
  UsuarioPublico,
} from '../types/usuario';

function toPublico(usuario: {
  senha?: string;
  senhaHash?: string;
  id: number;
  nome: string;
  email: string;
  emailVerificado?: boolean;
  status?: string | null;
}): UsuarioPublico {
  const { senha, senhaHash, ...publico } = usuario;
  return {
    ...publico,
    status: publico.status as StatusUsuario | null | undefined,
  };
}

export const usuariosRepositorio = {
  async buscarPorTokenRecuperacao(
    token: string,
  ): Promise<UsuarioPublico | null> {
    const tokenRecuperacao = await prisma.tokenRecuperacao.findUnique({
      where: { valor: token },
      include: { usuario: true },
    });
    if (!tokenRecuperacao || !tokenRecuperacao.usuario) return null;
    return toPublico(tokenRecuperacao.usuario);
  },

  async atualizarSenha(id: number, senhaHash: string) {
    await prisma.usuario.update({
      where: { id },
      data: { senhaHash },
    });
  },
  async listarTodos({ pagina = 1, limite = 20 } = {}): Promise<
    UsuarioPublico[]
  > {
    const skip = (pagina - 1) * limite;

    const usuarios = await prisma.usuario.findMany({
      skip,
      take: limite,
      orderBy: { id: 'desc' },
    });

    return usuarios.map(toPublico);
  },

  async buscarPorId(id: number): Promise<UsuarioPublico | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) return null;

    return toPublico(usuario);
  },

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        emailVerificado: true,
        status: true,
      },
    });
  },

  async buscarPorEmailComSenha(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
    });
  },

  async criar(dados: CriarUsuarioDTO): Promise<UsuarioPublico> {
    const usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha, 
        senhaHash: dados.senha, 
      },
    });

    return toPublico(usuario);
  },

  async atualizar(
    id: number,
    dados: AtualizarUsuarioDTO,
  ): Promise<UsuarioPublico> {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
        ...(dados.email !== undefined ? { email: dados.email } : {}),
      },
    });

    return toPublico(usuario);
  },

  async marcarEmailVerificado(id: number): Promise<void> {
    await prisma.usuario.update({
      where: { id },
      data: {
        emailVerificado: true,
        status: 'ativo',
      },
    });
  },

  async remover(id: number): Promise<void> {
    await prisma.usuario.delete({
      where: { id },
    });
  },
};
