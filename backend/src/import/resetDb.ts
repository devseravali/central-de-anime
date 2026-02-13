import { db } from '../db';
import { anime_estacao } from '../schema/anime_estacao';
import { anime_estudio } from '../schema/anime_estudio';
import { anime_genero } from '../schema/anime_genero';
import { anime_personagem } from '../schema/anime_personagem';
import { anime_plataforma } from '../schema/anime_plataforma';
import { anime_status } from '../schema/anime_status';
import { anime_tag } from '../schema/anime_tag';
import { temporadas } from '../schema/temporadas';
import { personagens } from '../schema/personagens';
import { estudios } from '../schema/estudios';
import { generos } from '../schema/generos';
import { status } from '../schema/status';
import { plataformas } from '../schema/plataformas';
import { tags } from '../schema/tags';
import { estacoes } from '../schema/estacoes';
import { animes } from '../schema/animes';
import { eq } from 'drizzle-orm';

export async function resetDb() {
  // Apagar tabelas de relacionamento e dependentes
  await db.delete(anime_estacao);
  await db.delete(anime_estudio);
  await db.delete(anime_genero);
  await db.delete(anime_personagem);
  await db.delete(anime_plataforma);
  await db.delete(anime_status);
  await db.delete(anime_tag);

  // Apagar tabelas intermediárias e entidades dependentes
  await db.delete(temporadas);
  await db.delete(personagens);
  await db.delete(animes);

  // Apagar entidades base (após animes e temporadas)
  await db.delete(estudios);
  await db.delete(generos);
  await db.delete(status);
  await db.delete(plataformas);
  await db.delete(tags);
  await db.delete(estacoes);

  console.log('Banco de dados limpo na ordem correta!');
}

// Popula o banco com dados mínimos para os testes
export async function seedDb() {
    // Estações
    let primavera = await db
        .select()
        .from(estacoes)
        .where(eq(estacoes.nome, 'Primavera'));
    if (!primavera[0]) {
        await db
            .insert(estacoes)
            .values({ nome: 'Primavera', slug: 'primavera' })
            .onConflictDoNothing();
        primavera = await db
            .select()
            .from(estacoes)
            .where(eq(estacoes.nome, 'Primavera'));
    }
    const estacaoId = primavera[0].id;

    // Status
    let statusAtivo = await db
        .select()
        .from(status)
        .where(eq(status.nome, 'Em andamento'));
    if (!statusAtivo[0]) {
        await db
            .insert(status)
            .values({ nome: 'Em andamento' })
            .onConflictDoNothing();
        statusAtivo = await db
            .select()
            .from(status)
            .where(eq(status.nome, 'Em andamento'));
    }
    const statusId = statusAtivo[0].id;

    // Estúdios
    let estudio = await db
        .select()
        .from(estudios)
        .where(eq(estudios.nome, 'Madhouse'));
    if (!estudio[0]) {
        await db
            .insert(estudios)
            .values({ nome: 'Madhouse', principaisObras: 'Obra X' })
            .onConflictDoNothing();
        estudio = await db
            .select()
            .from(estudios)
            .where(eq(estudios.nome, 'Madhouse'));
    }
    const estudioId = estudio[0].id;

    // Plataformas
    let plataforma = await db
        .select()
        .from(plataformas)
        .where(eq(plataformas.nome, 'Crunchyroll'));
    if (!plataforma[0]) {
        await db
            .insert(plataformas)
            .values({ nome: 'Crunchyroll' })
            .onConflictDoNothing();
        plataforma = await db
            .select()
            .from(plataformas)
            .where(eq(plataformas.nome, 'Crunchyroll'));
    }

    // Gêneros
    let genero = await db
        .select()
        .from(generos)
        .where(eq(generos.nome, 'Ação'));
    if (!genero[0]) {
        await db.insert(generos).values({ nome: 'Ação' }).onConflictDoNothing();
        genero = await db
            .select()
            .from(generos)
            .where(eq(generos.nome, 'Ação'));
    }

    // Tags
    let tag = await db
        .select()
        .from(tags)
        .where(eq(tags.nome, 'Shounen'));
    if (!tag[0]) {
        await db.insert(tags).values({ nome: 'Shounen' }).onConflictDoNothing();
        tag = await db
            .select()
            .from(tags)
            .where(eq(tags.nome, 'Shounen'));
    }

    // Anime
    let anime = await db
        .select()
        .from(animes)
        .where(eq(animes.nome, 'Shingeki no Kyojin'));
    if (!anime[0]) {
        await db
            .insert(animes)
            .values({
                nome: 'Shingeki no Kyojin',
                titulo_portugues: 'Ataque dos Titãs',
                titulo_ingles: 'Attack on Titan',
                titulo_japones: '進撃の巨人',
                estudio_id: estudioId,
            })
            .onConflictDoNothing();
        anime = await db
            .select()
            .from(animes)
            .where(eq(animes.nome, 'Shingeki no Kyojin'));
    }
    const animeId = anime[0].id;

    // Personagem
    let personagem = await db
        .select()
        .from(personagens)
        .where(eq(personagens.nome, 'Eren Yeager'));
    if (!personagem[0]) {
        await db
            .insert(personagens)
            .values({
                nome: 'Eren Yeager',
                idade_inicial: '15',
                sexo: 'Masculino',
            })
            .onConflictDoNothing();
    }

    // Temporada
    let temporada = await db
        .select()
        .from(temporadas)
        .where(eq(temporadas.nome, 'Primeira Temporada'));
    if (!temporada[0]) {
        await db
            .insert(temporadas)
            .values({
                anime_id: animeId,
                slug: 'primeira-temporada',
                nome: 'Primeira Temporada',
                temporada: 1,
                status_id: statusId,
                ano: '2013',
                estacao_id: estacaoId,
                episodios: 25,
                sinopse: 'Sinopse teste',
                capa_url: 'https://exemplo.com/capa.jpg',
            })
            .onConflictDoNothing();
    }

    if (
        import.meta.url ===
        `file://${process.cwd().replace(/\\/g, '/')}/src/import/resetDb.ts`
    ) {
        resetDb()
            .then(() => process.exit(0))
            .catch((e) => {
                console.error(e);
                process.exit(1);
            });
    }
}
