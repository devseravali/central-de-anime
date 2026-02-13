import { estudiosRepositorio } from '../repositories/estudiosRepositorio';
import type {
  Estudio,
  CriarEstudioDTO,
  AtualizarEstudioDTO,
} from '../types/estudio';

type EstudioComNomePossivelmenteNulo = Omit<Estudio, 'nome'> & {
  nome: string | null;
};

const normalizarEstudio = (
  estudio: EstudioComNomePossivelmenteNulo | undefined,
): Estudio | undefined => {
  if (!estudio || !estudio.nome) return undefined;
  return { ...estudio, nome: estudio.nome };
};

export const estudiosServico = {
  listar({ pagina = 1, limite = 20 } = {}): Promise<Estudio[]> {
    return estudiosRepositorio
      .estudios({ pagina, limite })
      .then((estudios) =>
        estudios
          .map(normalizarEstudio)
          .filter((estudio): estudio is Estudio => Boolean(estudio)),
      );
  },

  buscarPorId(id: number): Promise<Estudio | undefined> {
    return estudiosRepositorio.estudioPorId(String(id)).then(normalizarEstudio);
  },

  buscarPorNome(nome: string): Promise<Estudio | undefined> {
    return estudiosRepositorio.estudioPorNome(nome).then(normalizarEstudio);
  },

  listarAnimes(estudioId: number) {
    return estudiosRepositorio.animesPorEstudios(String(estudioId));
  },

  criar(dados: CriarEstudioDTO): Promise<Estudio> {
    return estudiosRepositorio
      .adicionarEstudio({
        nome: dados.nome,
        principaisObras: 'pendente',
      })
      .then((estudio) => {
        const normalizado = normalizarEstudio(estudio);
        if (!normalizado) throw new Error('Falha ao criar estúdio');
        return normalizado;
      });
  },

  atualizar(
    id: number,
    dados: AtualizarEstudioDTO,
  ): Promise<Estudio | undefined> {
    return estudiosRepositorio
      .atualizarEstudio(id, dados)
      .then(normalizarEstudio);
  },

  deletar(id: number): Promise<Estudio | undefined> {
    return estudiosRepositorio
      .deletarEstudio(String(id))
      .then(normalizarEstudio);
  },
};
