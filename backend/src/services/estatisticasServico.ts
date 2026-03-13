import { estatisticasRepositorio } from '../repositories/estatisticasRepositorio';
import { obterResumo } from '../helpers/estatisticasHelper';

export const estatisticasServico = {
  async obterEstatisticasUsuarios() {
    const total = await estatisticasRepositorio.contarUsuarios();
    return {
      totalUsuarios: total,
    };
  },
  /* ==========================================
     ESTATÍSTICAS GERAIS
  ========================================== */

  async obterEstatisticas() {
    try {
      const [
        animes,
        estudios,
        generos,
        plataformas,
        status,
        tags,
        estacoes,
        personagens,
      ] = await Promise.all([
        obterResumo(estatisticasRepositorio.contarAnimes, async () => []),

        obterResumo(
          estatisticasRepositorio.contarEstudios,
          estatisticasRepositorio.listarEstudiosPopulares,
        ),

        obterResumo(
          estatisticasRepositorio.contarGeneros,
          estatisticasRepositorio.listarGenerosPopulares,
        ),

        obterResumo(
          estatisticasRepositorio.contarPlataformas,
          estatisticasRepositorio.listarPlataformasPopulares,
        ),

        obterResumo(
          estatisticasRepositorio.contarStatus,
          estatisticasRepositorio.listarStatusPopulares,
        ),

        obterResumo(
          estatisticasRepositorio.contarTags,
          estatisticasRepositorio.listarTagsPopulares,
        ),

        obterResumo(
          estatisticasRepositorio.contarEstacoes,
          estatisticasRepositorio.listarEstacoesPopulares,
        ),

        obterResumo(estatisticasRepositorio.contarPersonagens, async () => []),
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
        totalEstacoes: estacoes.total,
        estacoesPopulares: estacoes.populares,
        totalPersonagens: personagens.total,
        personagensPopulares: personagens.populares,
      };
    } catch (err) {
      console.error('[ERRO ESTATISTICAS]', err);
      throw err;
    }
  },

  /* ==========================================
     TEMPORADAS
  ========================================== */

  async obterEstatisticasTemporadas(ano?: number) {
    const temporadas =
      await estatisticasRepositorio.listarTemporadasPorAnime(ano);

    return {
      totalTemporadas: temporadas.length,
      temporadasPopulares: temporadas,
    };
  },

  /* ==========================================
     POPULARES (Dashboard simplificado)
  ========================================== */

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

  /* ==========================================
     INDIVIDUAIS
  ========================================== */

  async obterEstatisticasTags() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarTags,
      estatisticasRepositorio.listarTagsPopulares,
    );

    return {
      totalTags: resumo.total,
      tagsPopulares: resumo.populares,
    };
  },

  async obterEstatisticasGeneros() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarGeneros,
      estatisticasRepositorio.listarGenerosPopulares,
    );

    return {
      totalGeneros: resumo.total,
      generosPopulares: resumo.populares,
    };
  },

  async obterEstatisticasEstudios() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarEstudios,
      estatisticasRepositorio.listarEstudiosPopulares,
    );

    return {
      totalEstudios: resumo.total,
      estudiosPopulares: resumo.populares,
    };
  },

  async obterEstatisticasStatus() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarStatus,
      estatisticasRepositorio.listarStatusPopulares,
    );

    return {
      totalStatus: resumo.total,
      statusPopulares: resumo.populares,
    };
  },

  async obterEstatisticasPlataformas() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarPlataformas,
      estatisticasRepositorio.listarPlataformasPopulares,
    );

    return {
      totalPlataformas: resumo.total,
      plataformasPopulares: resumo.populares,
    };
  },

  async obterEstatisticasEstacoes() {
    const resumo = await obterResumo(
      estatisticasRepositorio.contarEstacoes,
      estatisticasRepositorio.listarEstacoesPopulares,
    );

    return {
      totalEstacoes: resumo.total,
      estacoesPopulares: resumo.populares,
    };
  },

  async obterEstatisticasPersonagens() {
    const total = await estatisticasRepositorio.contarPersonagens();

    return {
      totalPersonagens: total,
      personagensPopulares: [],
    };
  },

  async obterEstatisticasAnimes() {
    const total = await estatisticasRepositorio.contarAnimes();

    return {
      totalAnimes: total,
      animesPopulares: [],
    };
  },

  async obterEstatisticasSimples() {
    const [totalAnimes, totalPersonagens, totalGeneros, totalEstudios] =
      await Promise.all([
        estatisticasRepositorio.contarAnimes(),
        estatisticasRepositorio.contarPersonagens(),
        estatisticasRepositorio.contarGeneros(),
        estatisticasRepositorio.contarEstudios(),
      ]);

    return {
      totalAnimes,
      totalPersonagens,
      totalGeneros,
      totalEstudios,
    };
  },
};
