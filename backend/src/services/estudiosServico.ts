import { estudiosRepositorio } from '../repositories/estudiosRepositorio';
import type {
  Estudio,
  CriarEstudioDTO,
  AtualizarEstudioDTO,
} from '../types/estudio';

const normalizarEstudio = (
  estudio: Estudio | null | undefined,
): Estudio | undefined => {
  if (!estudio || !estudio.nome) return undefined;
  return estudio;
};

export const estudiosServico = {
  async listar(): Promise<Estudio[]> {
    const estudios = await estudiosRepositorio.listarEstudios();
    return estudios.map(normalizarEstudio).filter(Boolean) as Estudio[];
  },

  async buscarPorId(id: number): Promise<Estudio | undefined> {
    const estudio = await estudiosRepositorio.estudioPorId(id);
    return normalizarEstudio(estudio);
  },

  async buscarPorNome(nome: string): Promise<Estudio | undefined> {
    const estudio = await estudiosRepositorio.estudioPorNome(nome);
    return normalizarEstudio(estudio);
  },

  async listarAnimes(estudioId: number) {
    return estudiosRepositorio.animesPorEstudios(estudioId);
  },

  async criar(dados: CriarEstudioDTO): Promise<Estudio> {
    const estudio = await estudiosRepositorio.adicionarEstudio(dados);
    const normalizado = normalizarEstudio(estudio);
    if (!normalizado) throw new Error('Falha ao criar estúdio');
    return normalizado;
  },

  async atualizar(
    id: number,
    dados: AtualizarEstudioDTO,
  ): Promise<Estudio | undefined> {
    const estudio = await estudiosRepositorio.atualizarEstudio(id, dados);
    return normalizarEstudio(estudio);
  },

  async deletar(id: number): Promise<Estudio | undefined> {
    await estudiosRepositorio.deletarEstudio(id);
    return undefined;
  },
};
