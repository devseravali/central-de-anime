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

  buscarPorId(id: number): Promise<Genero | null> {
    return generosRepositorio.porId(id);
  },

  buscarPorNome(nome: string): Promise<Genero | null> {
    return generosRepositorio.porNome(nome);
  },

  listarAnimesPorGeneroId(id: number) {
    return generosRepositorio.listarAnimesPorGeneroId(id);
  },

  listarAnimesPorNomeGenero(nome: string) {
    return generosRepositorio.listarAnimesPorNomeGenero(nome);
  },

  criar(dados: CriarGeneroDTO): Promise<Genero> {
    return generosRepositorio.criar(dados);
  },

  atualizar(id: number, dados: AtualizarGeneroDTO): Promise<Genero | null> {
    return generosRepositorio.atualizar(id, dados);
  },

  deletar(id: number): Promise<Genero | null> {
    return generosRepositorio.deletar(id);
  },
};