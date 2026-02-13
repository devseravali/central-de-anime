import { tagsRepositorio } from '../repositories/tagsRepositorio';
import type { Tag, CriarTagDTO, AtualizarTagDTO } from '../types/tag';

export const tagServico = {
  listar(): Promise<Tag[]> {
    return tagsRepositorio.listar();
  },

  buscarPorId(id: number): Promise<Tag | null> {
    return tagsRepositorio.porId(id);
  },

  buscarPorNome(nome: string): Promise<Tag[]> {
    return tagsRepositorio.buscarPorNome(nome);
  },

  criar(dados: CriarTagDTO): Promise<Tag> {
    return tagsRepositorio.criar(dados);
  },

  atualizar(id: number, dados: AtualizarTagDTO): Promise<Tag | null> {
    return tagsRepositorio.atualizar(id, dados);
  },

  deletar(id: number): Promise<Tag | null> {
    return tagsRepositorio.deletar(id);
  },
};