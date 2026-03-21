import { prisma } from '../lib/prisma';
import { CapaUpload, PersonagemUpload } from '../types/uploadTypes';

export async function salvarPersonagemImagem(
  dados: PersonagemUpload & { personagemId: number },
) {
  const personagem = await prisma.personagem.update({
    where: { id: dados.personagemId },
    data: {
      imagem: dados.nomeSalvo,
    },
  });
  return personagem;
}

export async function salvarCapa(dados: CapaUpload) {
  await prisma.capas.create({
    data: {
      nome_original: dados.nomeOriginal,
      nome_salvo: dados.nomeSalvo,
      caminho: dados.caminho,
      mime_type: dados.mimetype,
    },
  });
}
