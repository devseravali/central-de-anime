import { adminRepositorio } from '../repositories/adminRepositorio';
import { ErroApi } from '../errors/ErroApi';

export const adminService = {
  async listarAdmins() {
    return adminRepositorio.listarTodosUsuarios();
  },

  async obterAdminPorId(id: number) {
    const admin = await adminRepositorio.buscarUsuarioPorId(id);

    if (!admin || !admin.admin) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    return admin;
  },

  async adicionarAdmin(nome: string, email: string, senha: string) {
    const existente = await adminRepositorio.buscarUsuarioPorEmail(email);

    if (existente) {
      throw ErroApi.conflict('E-mail já cadastrado.');
    }

    return adminRepositorio.criarUsuario({ nome, email, senha });
  },

  async atualizarAdmin(id: number, nome?: string, email?: string) {
    const adminAtual = await adminRepositorio.buscarUsuarioPorId(id);

    if (!adminAtual || !adminAtual.admin) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    if (email && email !== adminAtual.email) {
      const outro = await adminRepositorio.buscarUsuarioPorEmail(email);
      if (outro) throw ErroApi.conflict('E-mail já cadastrado.');
    }

    return adminRepositorio.atualizarUsuario(id, { nome, email });
  },

  async removerAdmin(id: number) {
    const admin = await adminRepositorio.buscarUsuarioPorId(id);

    if (!admin || !admin.admin) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    await adminRepositorio.removerUsuario(id);
  },

  async suspenderUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) throw ErroApi.notFound('Usuário não encontrado.');

    return adminRepositorio.atualizarStatus(id, 'suspenso');
  },

  async banirUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) throw ErroApi.notFound('Usuário não encontrado.');

    return adminRepositorio.atualizarStatus(id, 'banido');
  },

  async reativarUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) throw ErroApi.notFound('Usuário não encontrado.');

    return adminRepositorio.atualizarStatus(id, 'ativo');
  },
};
