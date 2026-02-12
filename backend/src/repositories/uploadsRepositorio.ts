import { db } from '../db';
import { CapaUpload, PersonagemUpload } from '../types/uploadTypes';
import { capas } from '../schema/capas';
import { personagens } from '../schema/personagens';

export async function salvarPersonagem(dados: PersonagemUpload) {
  await db.insert(personagens).values({
    nome: dados.nomeOriginal,
  });
}

export async function salvarCapa(dados: CapaUpload) {
  await db.insert(capas).values({
    nome_original: dados.nomeOriginal,
    nome_salvo: dados.nomeSalvo,
    caminho: dados.caminho,
    mimetype: dados.mimetype,
    tamanho: dados.tamanho,
    usuario_id: dados.usuarioId,
    data_upload: dados.dataUpload,
  });
}
