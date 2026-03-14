import { personagemRepositorio } from '../repositories/personagemRepositorio';
import type { Personagem, AtualizarPersonagemDTO } from '../types/personagem';

export const personagensServico = {
  async listar(): Promise<Personagem[]> {
    return personagemRepositorio.listar();
  },

  async buscarPorId(id: number): Promise<Personagem | undefined> {
    return personagemRepositorio.porId(id);
  },

  async buscarPorNome(nome: string): Promise<Personagem | undefined> {
    return personagemRepositorio.porNome(nome);
  },

  async listarAnimesPorPersonagem(id: number) {
    return personagemRepositorio.listarAnimesPorPersonagemId(id);
  },

  async criar(dados: Personagem): Promise<Personagem> {
    return personagemRepositorio.criar(dados);
  },

  async atualizar(id: number, dados: AtualizarPersonagemDTO): Promise<Personagem | undefined> {
    return personagemRepositorio.atualizar(id, dados);
  },

  async deletar(id: number): Promise<Personagem | undefined> {
    return personagemRepositorio.deletar(id);
  },
};
