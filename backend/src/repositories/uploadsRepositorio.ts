import { prisma } from '../lib/prisma';
import { SalvarImagemDTO } from '../types/dtos/personagemDTO';

export async function salvarImagemPersonagem(dados: SalvarImagemDTO) {
  return prisma.personagemImagem.create({
    data: {
      nome_original: dados.nomeOriginal,
      nome_salvo: dados.nomeSalvo,
      caminho: dados.caminho,
      mimetype: dados.mimetype,
      tamanho: dados.tamanho,
      data_upload: new Date(),
      personagem_id: dados.personagemId,
    },
  });
}
