import { prisma } from '../lib/prisma';
import type { AtualizarPersonagemDTO, Personagem } from '../types/personagem';

export const personagemRepositorio = {
  async listar(): Promise<Personagem[]> {
    const personagem = await prisma.personagem.findMany();
    return personagem.map((p) => ({
      ...p,
      idade_inicial:
        p.idade_inicial !== null && p.idade_inicial !== undefined
          ? Number(p.idade_inicial)
          : 0,
      sexo: p.sexo ?? '',
      papel: p.papel ?? '',
      imagem: p.imagem ?? '',
      aniversario: p.aniversario ?? '',
      altura_inicial:
        p.altura_inicial !== null && p.altura_inicial !== undefined
          ? Number(p.altura_inicial)
          : 0,
      afiliacao: p.afiliacao ?? '',
      sobre: p.sobre ?? '',
    }));
  },

  async porId(id: number): Promise<Personagem | undefined> {
    const personagem = await prisma.personagem.findUnique({ where: { id } });
    if (!personagem) return undefined;
    return {
      ...personagem,
      idade_inicial:
        personagem.idade_inicial !== null &&
        personagem.idade_inicial !== undefined
          ? Number(personagem.idade_inicial)
          : 0,
      sexo: personagem.sexo ?? '',
      papel: personagem.papel ?? '',
      imagem: personagem.imagem ?? '',
      aniversario: personagem.aniversario ?? '',
      altura_inicial:
        personagem.altura_inicial !== null &&
        personagem.altura_inicial !== undefined
          ? Number(personagem.altura_inicial)
          : 0,
      afiliacao: personagem.afiliacao ?? '',
      sobre: personagem.sobre ?? '',
    };
  },

  async porNome(nome: string): Promise<Personagem | undefined> {
    const personagem = await prisma.personagem.findFirst({
      where: {
        nome: {
          contains: nome.replace(/\s/g, ''),
          mode: 'insensitive',
        },
      },
    });
    if (!personagem) return undefined;
    return {
      ...personagem,
      idade_inicial:
        personagem.idade_inicial !== null &&
        personagem.idade_inicial !== undefined
          ? Number(personagem.idade_inicial)
          : 0,
      sexo: personagem.sexo ?? '',
      papel: personagem.papel ?? '',
      imagem: personagem.imagem ?? '',
      aniversario: personagem.aniversario ?? '',
      altura_inicial:
        personagem.altura_inicial !== null &&
        personagem.altura_inicial !== undefined
          ? Number(personagem.altura_inicial)
          : 0,
      afiliacao: personagem.afiliacao ?? '',
      sobre: personagem.sobre ?? '',
    };
  },

  listarAnimesPorPersonagemId(personagemId: number) {
    return prisma.animePersonagem.findMany({
      where: { personagem_id: personagemId },
      include: { anime: true },
    });
  },

  async criar(dados: Personagem): Promise<Personagem> {
    const { id, ...dadosSemId } = dados;
    if (!dadosSemId.nome) {
      throw new Error("O campo 'nome' é obrigatório para criar um personagem.");
    }
    const personagem = await prisma.personagem.create({
      data: {
        ...dadosSemId,
        nome: dadosSemId.nome as string,
        idade_inicial:
          dadosSemId.idade_inicial !== null &&
          dadosSemId.idade_inicial !== undefined
            ? typeof dadosSemId.idade_inicial === 'string'
              ? Number(dadosSemId.idade_inicial)
              : dadosSemId.idade_inicial
            : 0,
        altura_inicial:
          dadosSemId.altura_inicial !== null &&
          dadosSemId.altura_inicial !== undefined
            ? typeof dadosSemId.altura_inicial === 'string'
              ? Number(dadosSemId.altura_inicial)
              : dadosSemId.altura_inicial
            : 0,
      },
    });
    return {
      ...personagem,
      idade_inicial:
        personagem.idade_inicial !== null &&
        personagem.idade_inicial !== undefined
          ? Number(personagem.idade_inicial)
          : 0,
      sexo: personagem.sexo ?? '',
      papel: personagem.papel ?? '',
      imagem: personagem.imagem ?? '',
      aniversario: personagem.aniversario ?? '',
      altura_inicial:
        personagem.altura_inicial !== null &&
        personagem.altura_inicial !== undefined
          ? Number(personagem.altura_inicial)
          : 0,
      afiliacao: personagem.afiliacao ?? '',
      sobre: personagem.sobre ?? '',
    };
  },

  async atualizar(
    id: number,
    dados: AtualizarPersonagemDTO,
  ): Promise<Personagem | undefined> {
    const data: any = { ...dados };
    if (dados.idade_inicial !== undefined) {
      data.idade_inicial =
        typeof dados.idade_inicial === 'string'
          ? Number(dados.idade_inicial)
          : dados.idade_inicial;
    }
    if (dados.altura_inicial !== undefined && dados.altura_inicial !== null) {
      data.altura_inicial =
        typeof dados.altura_inicial === 'string'
          ? Number(dados.altura_inicial)
          : dados.altura_inicial;
    }
    const personagem = await prisma.personagem.update({
      where: { id },
      data,
    });
    return {
      ...personagem,
      idade_inicial:
        personagem.idade_inicial !== null &&
        personagem.idade_inicial !== undefined
          ? Number(personagem.idade_inicial)
          : 0,
      sexo: personagem.sexo ?? '',
      papel: personagem.papel ?? '',
      imagem: personagem.imagem ?? '',
      aniversario: personagem.aniversario ?? '',
      altura_inicial:
        personagem.altura_inicial !== null &&
        personagem.altura_inicial !== undefined
          ? Number(personagem.altura_inicial)
          : 0,
      afiliacao: personagem.afiliacao ?? '',
      sobre: personagem.sobre ?? '',
    };
  },

  async deletar(id: number): Promise<Personagem | undefined> {
    const personagem = await prisma.personagem.delete({ where: { id } });
    if (!personagem) return undefined;
    return {
      ...personagem,
      idade_inicial:
        personagem.idade_inicial !== null &&
        personagem.idade_inicial !== undefined
          ? Number(personagem.idade_inicial)
          : 0,
      sexo: personagem.sexo ?? '',
      papel: personagem.papel ?? '',
      imagem: personagem.imagem ?? '',
      aniversario: personagem.aniversario ?? '',
      altura_inicial:
        personagem.altura_inicial !== null &&
        personagem.altura_inicial !== undefined
          ? Number(personagem.altura_inicial)
          : 0,
      afiliacao: personagem.afiliacao ?? '',
      sobre: personagem.sobre ?? '',
    };
  },
};
