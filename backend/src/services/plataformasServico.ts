import { plataformaRepositorio } from '../repositories/plataformasRepositorio';
import type {
  Plataforma,
  CriarPlataformaDTO,
  AtualizarPlataformaDTO,
} from '../types/plataforma';

export const plataformaServico = {
  listar(): Promise<Plataforma[]> {
    return plataformaRepositorio.listar();
  },

  buscarPorId(id: number): Promise<Plataforma | undefined> {
    return plataformaRepositorio.porId(id);
  },

  buscarPorNome(nome: string): Promise<Plataforma | undefined> {
    return plataformaRepositorio.porNome(nome);
  },

  listarAnimes(plataformaId: number) {
    return plataformaRepositorio.animesPorPlataformaId(plataformaId);
  },

  criar(dados: CriarPlataformaDTO): Promise<Plataforma> {
    return plataformaRepositorio.criar(dados);
  },

  atualizar(
    id: number,
    dados: AtualizarPlataformaDTO,
  ): Promise<Plataforma | undefined> {
    return plataformaRepositorio.atualizar(id, dados);
  },

  deletar(id: number): Promise<Plataforma | undefined> {
    return plataformaRepositorio.deletar(id);
  },
};