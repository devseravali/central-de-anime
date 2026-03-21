import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export const adminRepositorio = {
  async promoverParaAdmin(id: number) {
    const adminExistente = await prisma.admin.findUnique({
      where: { usuarioId: id },
    });

    if (adminExistente) {
      return adminExistente;
    }

    return prisma.admin.create({
      data: { usuarioId: id },
    });
  },

  listarAdmins() {
    return prisma.usuario.findMany({
      where: {
        admin: { isNot: null },
      },
      orderBy: { id: 'asc' },
      include: { admin: true },
    });
  },

  buscarUsuarioPorId(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        senhaHash: true,
        status: true,
        emailVerificado: true,
        admin: true,
      },
    });
  },

  buscarUsuarioPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
    });
  },

  async criarUsuario(data: { nome: string; email: string; senha: string }) {
    const senhaHash = await bcrypt.hash(data.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        senhaHash: senhaHash,
      },
    });

    await prisma.admin.create({
      data: {
        usuarioId: usuario.id,
      },
    });

    return prisma.usuario.findUnique({
      where: { id: usuario.id },
      include: { admin: true },
    });
  },

  async atualizarUsuario(
    id: number,
    data: { nome?: string; email?: string; senha?: string },
  ) {
    let senhaHash;

    if (data.senha) {
      senhaHash = await bcrypt.hash(data.senha, 10);
    }

    return prisma.usuario.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        senhaHash: senhaHash,
      },
      include: { admin: true },
    });
  },

  async removerUsuario(id: number) {
    await prisma.admin.deleteMany({
      where: { usuarioId: id },
    });

    return prisma.usuario.delete({
      where: { id },
    });
  },

  atualizarStatus(id: number, status: 'ativo' | 'suspenso' | 'banido') {
    return prisma.usuario.update({
      where: { id },
      data: { status },
    });
  },
};