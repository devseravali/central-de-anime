import { adminRepositorio } from '../repositories/adminRepositorio';
import { ErroApi } from '../errors/ErroApi';
import { adminSchema } from '../schemas/adminSchema';

export const adminService = {
  async promoverAdmin(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id, true);

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    await adminRepositorio.promoverParaAdmin(id);

    return adminRepositorio.buscarUsuarioPorId(id);
  },

  async listarAdmins() {
    return adminRepositorio.listarAdmins();
  },

  async obterAdminPorId(id: number) {
    const admin = await adminRepositorio.buscarUsuarioPorId(id, true);

    if (!admin) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    return admin;
  },

  async adicionarAdmin(nome: string, email: string, senha: string) {
    const parseResult = adminSchema.safeParse({ nome, email, senha });

    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_ADMIN_DATA');
    }

    const {
      nome: nomeValid,
      email: emailValid,
      senha: senhaValid,
    } = parseResult.data;

    const existente = await adminRepositorio.buscarUsuarioPorEmail(emailValid);

    if (existente) {
      throw ErroApi.conflict('E-mail já cadastrado.');
    }

    return adminRepositorio.criarUsuario({
      nome: nomeValid,
      email: emailValid,
      senha: senhaValid,
    });
  },

  async atualizarAdmin(
    id: number,
    nome?: string,
    email?: string,
    senha?: string,
  ) {
    const adminAtual = await adminRepositorio.buscarUsuarioPorId(id, true);

    if (!adminAtual) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    if (email && email !== adminAtual.email) {
      const outro = await adminRepositorio.buscarUsuarioPorEmail(email);

      if (outro) {
        throw ErroApi.conflict('E-mail já cadastrado.');
      }
    }

    return adminRepositorio.atualizarUsuario(id, {
      nome,
      email,
      senha,
    });
  },

  async removerAdmin(id: number) {
    const admin = await adminRepositorio.buscarUsuarioPorId(id, true);

    if (!admin) {
      throw ErroApi.notFound('Administrador não encontrado.');
    }

    await adminRepositorio.removerUsuario(id);

    return { mensagem: 'Administrador removido com sucesso.' };
  },

  async suspenderUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    return adminRepositorio.atualizarStatus(id, 'suspenso');
  },

  async banirUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    return adminRepositorio.atualizarStatus(id, 'banido');
  },

  async reativarUsuario(id: number) {
    const usuario = await adminRepositorio.buscarUsuarioPorId(id);

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    return adminRepositorio.atualizarStatus(id, 'ativo');
  },
};