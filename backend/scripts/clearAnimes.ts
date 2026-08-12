import { prisma } from '../src/config/prisma';

async function main() {
  try {
    console.log('Apagando relacionamentos de animes (AnimePersonagem, AnimeGenero, AnimePlataforma, AnimeTagAnime)...');
    await prisma.animePersonagem.deleteMany({});
    await prisma.animeGenero.deleteMany({});
    await prisma.animePlataforma.deleteMany({});
    await prisma.animeTagAnime.deleteMany({});

    console.log('Apagando favoritos, notas e cache relacionados a animes...');
    await prisma.usuarioFavoritoAnime.deleteMany({});
    await prisma.notaAnimeUsuario.deleteMany({});
    await prisma.cacheAnime.deleteMany({});

    console.log('Apagando episódios relacionados a animes...');
    await prisma.episodio.deleteMany({});

    console.log('Apagando animes...');
    const result = await prisma.anime.deleteMany({});
    console.log(`Animes apagados: ${result.count}`);
  } catch (err) {
    console.error('Erro ao apagar animes:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Script falhou:', e);
  process.exit(1);
});
