import {
  dadosRepositorio,
  BuscaPorNomeResultado,
} from '../repositories/dadosRepositorio';

export const dadosServico = {
  async listarPersonagens() {
    return dadosRepositorio.listarPersonagens();
  },

  async listarAnimes() {
    return dadosRepositorio.listarAnimes();
  },

  async listarEstacoes() {
    return dadosRepositorio.listarEstacoes();
  },

  async listarGeneros() {
    return dadosRepositorio.listarGeneros();
  },

  async listarPlataformas() {
    return dadosRepositorio.listarPlataformas();
  },

  async listarStatus() {
    return dadosRepositorio.listarStatus();
  },

  async listarTags() {
    return dadosRepositorio.listarTags();
  },

  async listarEstudios() {
    return dadosRepositorio.listarEstudios();
  },

  async listarTemporadas() {
    return dadosRepositorio.listarTemporadas();
  },

  async buscarPorNome(entidade: string, nome: string) {
    return dadosRepositorio.buscarPorNomeRepositorio(entidade, nome);
  },

  async obterDadosIniciais() {
    const [generos, plataformas, status, tags, estudios, estacoes] =
      await Promise.all([
        dadosRepositorio.listarGeneros(),
        dadosRepositorio.listarPlataformas(),
        dadosRepositorio.listarStatus(),
        dadosRepositorio.listarTags(),
        dadosRepositorio.listarEstudios(),
        dadosRepositorio.listarEstacoes(),
      ]);

    return {
      generos,
      plataformas,
      status,
      tags,
      estudios,
      estacoes,
    };
  }
};

