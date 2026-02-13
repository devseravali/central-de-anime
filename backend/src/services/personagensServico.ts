import { personagemRepositorio } from '../repositories/personagensRepositorio';
import type { Personagem } from '../types/personagem';
import type {
  PersonagemInput,
  PersonagemUpdateInput,
} from '../types/personagemPayload';
import type {
  CriarPersonagemDTO,
  AtualizarPersonagemDTO,
} from '../types/personagem';

function resolverSobre(
  dados: { Sobre?: string; sobre?: string },
  fallback = '',
): string {
  if (typeof dados.Sobre === 'string' && dados.Sobre.trim().length > 0) {
    return dados.Sobre.trim();
  }
  if (typeof dados.sobre === 'string' && dados.sobre.trim().length > 0) {
    return dados.sobre.trim();
  }
  return fallback;
}

function mapCriacao(dados: PersonagemInput): CriarPersonagemDTO {
  return {
    nome: dados.nome,
    idade_inicial: dados.idade_inicial ?? 0,
    sexo: dados.sexo ?? '',
    papel: dados.papel ?? '',
    imagem: dados.imagem ?? '',
    aniversario: dados.aniversario ?? '',
    altura_inicial:
      dados.altura_inicial !== undefined ? String(dados.altura_inicial) : '',
    afiliacao: dados.afiliacao ?? '',
    sobre: resolverSobre(dados, ''),
  };
}

function mapAtualizacao(
  dados: PersonagemUpdateInput,
  fallbackSobre: string,
): AtualizarPersonagemDTO {
  return {
    ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
    ...(dados.idade_inicial !== undefined
      ? { idade_inicial: dados.idade_inicial }
      : {}),
    ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
    ...(dados.papel !== undefined ? { papel: dados.papel } : {}),
    ...(dados.imagem !== undefined ? { imagem: dados.imagem } : {}),
    ...(dados.aniversario !== undefined
      ? { aniversario: dados.aniversario }
      : {}),
    ...(dados.altura_inicial !== undefined
      ? { altura_inicial: String(dados.altura_inicial) }
      : {}),
    ...(dados.afiliacao !== undefined ? { afiliacao: dados.afiliacao } : {}),
    ...{ sobre: resolverSobre(dados, fallbackSobre) },
  };
}

export const personagemServico = {
  buscarTodosPersonagens(): Promise<Personagem[]> {
    return personagemRepositorio.listar();
  },

  buscarPersonagemPorId(id: number): Promise<Personagem | undefined> {
    return personagemRepositorio.porId(id);
  },

  buscarPersonagemPorNome(nome: string): Promise<Personagem | undefined> {
    return personagemRepositorio.porNome(nome);
  },

  listarAnimesPorPersonagemId(personagemId: number) {
    return personagemRepositorio.listarAnimesPorPersonagemId(personagemId);
  },

  adicionarPersonagem(dados: PersonagemInput): Promise<Personagem> {
    return personagemRepositorio.criar(mapCriacao(dados));
  },

  async atualizarPersonagem(
    id: number,
    dados: PersonagemUpdateInput,
  ): Promise<Personagem | undefined> {
    const atual = await personagemRepositorio.porId(id);
    if (!atual) return undefined;

    return personagemRepositorio.atualizar(
      id,
      mapAtualizacao(dados, atual.sobre),
    );
  },

  deletarPersonagem(id: number): Promise<Personagem | undefined> {
    return personagemRepositorio.deletar(id);
  },
};
