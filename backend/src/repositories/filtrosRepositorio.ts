import { normalizarTextoComparacao } from '../helpers/textHelpers';
import { prisma } from '../lib/prisma';

export const filtrosRepositorio = {
  async buscarTodosFiltros(
    filtroGeneros?: string[],
    filtroAno?: number,
    filtroEstacao?: string,
  ) {
    let generos = await prisma.genero.findMany();
    if (filtroGeneros?.length) {
      const generosNormalizados = filtroGeneros.map(normalizarTextoComparacao);
      generos = generos.filter((g: { nome: string }) =>
        generosNormalizados.includes(normalizarTextoComparacao(g.nome)),
      );
    }

    const status = await prisma.status.findMany();

    const estudios = await prisma.estudio.findMany();

    let estacoes = await prisma.estacao.findMany();
    if (filtroEstacao) {
      estacoes = estacoes.filter(
        (e: { nome: string }) =>
          normalizarTextoComparacao(e.nome) ===
          normalizarTextoComparacao(filtroEstacao),
      );
    }

    const anos = await prisma.anime.findMany({
      where: filtroAno ? { ano: filtroAno } : undefined,
      select: { ano: true },
      distinct: ['ano'],
      orderBy: { ano: 'desc' },
    });

    const animes = await prisma.anime.findMany({
      where: filtroAno ? { ano: filtroAno } : undefined,
      include: {
        animeGeneros: { include: { genero: true } },
        estudio: true,
      },
    });

    return {
      generos,
      status,
      estudios,
      estacoes,
      anos: anos.map((a: { ano: number }) => a.ano),
      animes,
    };
  },

  async buscarPersonagens(nome?: string) {
    return await prisma.personagem.findMany({
      where: nome
        ? { nome: { contains: nome, mode: 'insensitive' } }
        : undefined,
    });
  },
};
