import { estacoesRepositorio } from '../repositories/estacoesRepositorio';
import type { EstacaoInput } from '../types/estacao';

export const estacoesServico = {
  listarEstacoes() {
    return estacoesRepositorio.listarTodos();
  },

  listarEstacaoPorId(id: string) {
    return estacoesRepositorio.listarEstacaoPorId(Number(id));
  },

  listarEstacaoPorNome(nome: string) {
    return estacoesRepositorio.listarEstacaoPorNome(nome);
  },

  adicionarEstacao(data: EstacaoInput) {
    return estacoesRepositorio.adicionarEstacao(data.nome, data.slug ?? '');
  },

  atualizarEstacao(id: number, data: EstacaoInput) {
    return estacoesRepositorio.atualizarEstacao(id, data.nome);
  },

  removerEstacao(id: number) {
    return estacoesRepositorio.removerEstacao(id);
  },
};
