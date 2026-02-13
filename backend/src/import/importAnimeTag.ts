import { db } from '../db';
import { anime_tag } from '../schema/anime_tag';
import animeTagData from '../../data/relacionamentos/anime_tag.json';

export async function importAnimeTag() {
  console.log('Tipo de animeTagData:', typeof animeTagData);
  if (!Array.isArray(animeTagData)) {
    console.error('ERRO: animeTagData não é um array! Conteúdo:', animeTagData);
    return;
  }
  console.log('Tamanho do array:', animeTagData.length);
  await db.delete(anime_tag);
  await db.execute('ALTER SEQUENCE anime_tag_id_seq RESTART WITH 1;');
  console.log('Tabela anime_tag limpa.');
  let sucesso = 0;
  let falha = 0;
  if (animeTagData.length === 0) {
    console.warn('Nenhum dado encontrado para importar!');
    return;
  }
  for (const at of animeTagData) {
    try {
      await db.insert(anime_tag).values({
        anime_id: at.anime_id,
        tag_id: at.tag_id,
      });
      sucesso++;
      if (sucesso <= 5) {
        console.log(
          `Importado relacionamento anime_tag: Anime ID ${at.anime_id} - Tag ID ${at.tag_id}`,
        );
      }
    } catch (error) {
      falha++;
      console.error(
        `Erro ao importar: Anime ID ${at.anime_id} - Tag ID ${at.tag_id}`,
        error,
      );
    }
  }
  console.log(
    `Importação de anime_tag concluída! Sucesso: ${sucesso}, Falha: ${falha}`,
  );
}

importAnimeTag();
