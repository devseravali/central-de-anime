import {
  dadosRepositorio,
  BuscaPorNomeResultado,
} from '../repositories/dadosRepositorio';

export const dadosServico = {
  listarTodos() {
    return Promise.all([
      dadosRepositorio.listarGeneros(),
      dadosRepositorio.listarPlataformas(),
      dadosRepositorio.listarStatus(),
      dadosRepositorio.listarTags(),
      dadosRepositorio.listarAnimes(),
      dadosRepositorio.listarEstacoes(),
      dadosRepositorio.listarPersonagens(),
    ]).then(
      ([
        generos,
        plataformas,
        status,
        tags,
        animes,
        estacoes,
        personagens,
      ]) => ({
        generos,
        plataformas,
        status,
        tags,
        animes,
        estacoes,
        personagens,
      }),
    );
  },

  listarTemporadas() {
    return dadosRepositorio.listarTemporadas();
  },

  async buscarPorNome(entidade: keyof BuscaPorNomeResultado, nome: string) {
    return dadosRepositorio.buscarPorNomeRepositorio(entidade, nome);
  },
};
