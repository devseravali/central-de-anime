import { db } from '../db';
import { anime_personagem } from '../schema/anime_personagem';
import animePersonagemData from '../../data/relacionamentos/anime_personagem.json';

export async function importAnimePersonagem() {
  console.log('Tipo de animePersonagemData:', typeof animePersonagemData);
  if (!Array.isArray(animePersonagemData)) {
    console.error(
      'ERRO: animePersonagemData não é um array! Conteúdo:',
      animePersonagemData,
    );
    return;
  }
  console.log('Tamanho do array:', animePersonagemData.length);
  await db.delete(anime_personagem);
  await db.execute('ALTER SEQUENCE anime_personagem_id_seq RESTART WITH 1;');
  console.log('Tabela anime_personagem limpa.');
  let sucesso = 0;
  let falha = 0;
  if (animePersonagemData.length === 0) {
    console.warn('Nenhum dado encontrado para importar!');
    return;
  }
  for (const ap of animePersonagemData) {
    try {
      await db.insert(anime_personagem).values({
        anime_id: ap.anime_id,
        personagem_id: ap.personagem_id,
      });
      sucesso++;
      if (sucesso <= 5) {
        console.log(
          `Importado relacionamento anime_personagem: Anime ID ${ap.anime_id} - Personagem ID ${ap.personagem_id}`,
        );
      }
    } catch (error) {
      falha++;
      console.error(
        `Erro ao importar: Anime ID ${ap.anime_id} - Personagem ID ${ap.personagem_id}`,
        error,
      );
    }
  }
  console.log(
    `Importação de anime_personagem concluída! Sucesso: ${sucesso}, Falha: ${falha}`,
  );
}

importAnimePersonagem();
