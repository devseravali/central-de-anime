import { estatisticasRepositorio } from '../repositories/estatisticasRepositorio';
import { obterResumo } from '../helpers/estatisticasHelper';

export const estatisticasServico = {
  async obterEstatisticas() {
    const [
      animes,
      estudios,
      generos,
      plataformas,
      status,
      tags,
      temporadas,
      estacoes,
      personagens,
    ] = await Promise.all([
      obterResumo(
        estatisticasRepositorio.contarAnimes,
        estatisticasRepositorio.listarAnimesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarEstudios,
        estatisticasRepositorio.listarEstacoesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarGeneros,
        estatisticasRepositorio.listarAnimesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarPlataformas,
        estatisticasRepositorio.listarPlataformasPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarStatus,
        estatisticasRepositorio.listarEstacoesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarTags,
        estatisticasRepositorio.listarEstacoesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarTemporadas,
        estatisticasRepositorio.listarTemporadasPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarEstacoes,
        estatisticasRepositorio.listarEstacoesPopulares,
      ),
      obterResumo(
        estatisticasRepositorio.contarPersonagens,
        estatisticasRepositorio.listarEstacoesPopulares,
      ),
    ]);

    return {
      totalAnimes: animes.total,
      animesPopulares: animes.populares,

      totalEstudios: estudios.total,
      estudiosPopulares: estudios.populares,

      totalGeneros: generos.total,
      generosPopulares: generos.populares,

      totalPlataformas: plataformas.total,
      plataformasPopulares: plataformas.populares,

      totalStatus: status.total,
      statusPopulares: status.populares,

      totalTags: tags.total,
      tagsPopulares: tags.populares,

      totalTemporadas: temporadas.total,
      temporadasPopulares: temporadas.populares,

      totalEstacoes: estacoes.total,
      estacoesPopulares: estacoes.populares,

      totalPersonagens: personagens.total,
      personagensPopulares: personagens.populares,
    };
  },

  async obterEstatisticasTemporadas(ano?: string) {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarTemporadas,
      estatisticasRepositorio.listarTemporadasPopulares,
      [ano],
    );

    return {
      totalTemporadas: total,
      temporadasPopulares: populares,
    };
  },

  async obterEstatisticasAnimes() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarAnimes,
      estatisticasRepositorio.listarAnimesPopulares,
    );

    return {
      totalAnimes: total,
      animesPopulares: populares,
    };
  },

  async obterEstatisticasGeneros() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarGeneros,
      estatisticasRepositorio.listarAnimesPopulares,
    );

    return {
      totalGeneros: total,
      generosPopulares: populares,
    };
  },

  async obterEstatisticasEstudios() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarEstudios,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalEstudios: total,
      estudiosPopulares: populares,
    };
  },

  async obterEstatisticasPlataformas() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarPlataformas,
      estatisticasRepositorio.listarPlataformasPopulares,
    );

    return {
      totalPlataformas: total,
      plataformasPopulares: populares,
    };
  },

  async obterEstatisticasStatus() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarStatus,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalStatus: total,
      statusPopulares: populares,
    };
  },

  async obterEstatisticasTags() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarTags,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalTags: total,
      tagsPopulares: populares,
    };
  },

  async obterEstatisticasEstacoes() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarEstacoes,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalEstacoes: total,
      estacoesPopulares: populares,
    };
  },

  async obterEstatisticasPersonagens() {
    const { total, populares } = await obterResumo(
      estatisticasRepositorio.contarPersonagens,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalPersonagens: total,
      personagensPopulares: populares,
    };
  },
  async obterEstatisticasPopulares(limit = 5) {
    const [tags, status, generos, estudios, plataformas] = await Promise.all([
      estatisticasRepositorio.listarTagsPopulares(limit),
      estatisticasRepositorio.listarStatusPopulares(limit),
      estatisticasRepositorio.listarGenerosPopulares(limit),
      estatisticasRepositorio.listarEstudiosPopulares(limit),
      estatisticasRepositorio.listarPlataformasPopulares(limit),
    ]);
    return {
      tagsPopulares: tags,
      statusPopulares: status,
      generosPopulares: generos,
      estudiosPopulares: estudios,
      plataformasPopulares: plataformas,
    };
  },
};
