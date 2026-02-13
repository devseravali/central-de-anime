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

  async listarTemporadas() {
    return dadosRepositorio.listarTemporadas();
  },

  async listarEstudios() {
    return dadosRepositorio.listarEstudios();
  },

  async obterDadosIniciais() {
    const [generos, plataformas, status, tags, temporadas, estudios, estacoes] =
      await Promise.all([
        dadosRepositorio.listarGeneros(),
        dadosRepositorio.listarPlataformas(),
        dadosRepositorio.listarStatus(),
        dadosRepositorio.listarTags(),
        dadosRepositorio.listarTemporadas(),
        dadosRepositorio.listarEstudios(),
        dadosRepositorio.listarEstacoes(),
      ]);

    return {
      generos,
      plataformas,
      status,
      tags,
      temporadas,
      estudios,
      estacoes,
    };
  },

  async buscarPorNome(
    entidade: string,
    nome: string,
  ): Promise<BuscaPorNomeResultado> {
    return dadosRepositorio.buscarPorNome(entidade, nome);
  },
};