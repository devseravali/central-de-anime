import { prisma } from '../lib/prisma';
import { ErroApi } from '../errors/ErroApi';
import { salvarCapa } from '../repositories/capaRepositorio';
import { SalvarCapaDTO } from '../types/dtos/capaDTO';

export const capaServico = {
  async salvar(dados: SalvarCapaDTO) {
    const anime = await prisma.animes.findUnique({
      where: { id: dados.animeId },
    });

    if (!anime) {
      throw ErroApi.notFound('Anime', 'ANIME_NOT_FOUND');
    }

    return salvarCapa({
      ...dados,
      usuarioId: dados.usuarioId ?? null,
      dataUpload: new Date(),
      tamanho: dados.tamanho ?? 0, 
    });
  },
};
