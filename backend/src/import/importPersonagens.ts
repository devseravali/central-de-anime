import { db } from '../db';
import { personagens } from '../schema/personagens';
import personagensData from '../../data/entidades/personagens.json';
import { asyncWrapProviders } from 'node:async_hooks';

export async function importPersonagens() {
  await db.delete(personagens);
  await db.execute('ALTER SEQUENCE personagens_id_seq RESTART WITH 1;');
  for (const personagem of personagensData) {
    await db.insert(personagens).values({
      nome: personagem.nome,
      idade_inicial: personagem.idade_inicial?.toString() ?? '',
      sexo: personagem.sexo,
      papel: personagem.papel,
      imagem: personagem.imagem,
      aniversario: personagem.aniversario,
      altura_inicial: personagem.altura_inicial?.toString() ?? '',
      afiliacao: personagem.afiliacao,
      sobre: Array.isArray(personagem.Sobre)
        ? personagem.Sobre.join(' ')
        : (personagem.Sobre ?? null),
    });
    console.log(`Importado personagens: ${personagem.nome}`);
  }
}

importPersonagens();
