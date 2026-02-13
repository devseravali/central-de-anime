import { statusRepositorio } from '../repositories/statusRepositorio';
import type {
  Status,
  CriarStatusDTO,
  AtualizarStatusDTO,
} from '../types/status';

export const statusServico = {
  listar(): Promise<Status[]> {
    return statusRepositorio.listar();
  },

  buscarPorId(id: number): Promise<Status | null> {
    return statusRepositorio.porId(id);
  },

  buscarPorNome(nome: string): Promise<Status | null> {
    return statusRepositorio.porNome(nome);
  },

  criar(dados: CriarStatusDTO): Promise<Status> {
    return statusRepositorio.criar(dados);
  },

  atualizar(id: number, dados: AtualizarStatusDTO): Promise<Status | null> {
    return statusRepositorio.atualizar(id, dados);
  },

  deletar(id: number): Promise<Status | null> {
    return statusRepositorio.deletar(id);
  },
};