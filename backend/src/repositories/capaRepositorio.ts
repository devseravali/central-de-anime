import { prisma } from '../lib/prisma';
import { CapaUpload, PersonagemUpload } from '../types/uploadTypes';

export async function salvarPersonagem(dados: PersonagemUpload) {
  const personagem = await prisma.personagens.create({
    data: {
      nome: dados.nomeOriginal,
    },
  });
  return personagem;
}

export async function salvarPersonagemImagem(
  dados: PersonagemUpload & { personagemId: number },
) {
  const imagem = await prisma.personagemImagem.create({
    data: {
      nome_original: dados.nomeOriginal,
      nome_salvo: dados.nomeSalvo,
      caminho: dados.caminho,
      mimetype: dados.mimetype,
      tamanho: dados.tamanho,
      data_upload: dados.dataUpload,
      personagem_id: dados.personagemId,
    },
  });
  return imagem;
}
export async function salvarCapa(dados: CapaUpload) {
  await prisma.capas.create({
    data: {
      nome_original: dados.nomeOriginal,
      nome_salvo: dados.nomeSalvo,
      caminho: dados.caminho,
      mimetype: dados.mimetype,
      tamanho: dados.tamanho,
      data_upload: dados.dataUpload,
    },
  });
}
