import { generosRepositorio } from '../repositories/generosRepositorio';
import type {
  Genero,
  CriarGeneroDTO,
  AtualizarGeneroDTO,
} from '../types/genero';

export const generosServico = {
  listar({ pagina = 1, limite = 20 } = {}): Promise<Genero[]> {
    return generosRepositorio.listar({ pagina, limite });
  },

  buscarPorId(id: number): Promise<Genero | undefined> {
    return generosRepositorio.porId(id);
  },

  buscarPorNome(nome: string): Promise<Genero | undefined> {
    return generosRepositorio.porNome(nome);
  },

  listarAnimesPorGeneroId(id: number) {
    return generosRepositorio.animesPorGeneroId(id);
  },

  listarAnimesPorNomeGenero(nome: string) {
    return generosRepositorio.animesPorNomeGenero(nome);
  },

  criar(dados: CriarGeneroDTO): Promise<Genero> {
    return generosRepositorio.criar(dados);
  },

  atualizar(
    id: number,
    dados: AtualizarGeneroDTO,
  ): Promise<Genero | undefined> {
    return generosRepositorio.atualizar(id, dados);
  },

  deletar(id: number): Promise<Genero | undefined> {
    return generosRepositorio.deletar(id);
  },
};
