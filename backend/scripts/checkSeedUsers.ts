import { prisma } from '../src/config/prisma';

async function main() {
  try {
    const admin = await prisma.admin.findMany({});
    const wpCount = await prisma.watchProgress.count();
    const favCount = await prisma.usuarioFavoritoAnime.count();
    const notaCount = await prisma.notaAnimeUsuario.count();
    const personagemFavCount = await prisma.personagemFavorito.count();
    const rankingCount = await prisma.rankingUsuario.count();
    const cacheCount = await prisma.cacheAnime.count();
    const filtroCount = await prisma.filtro.count();

    console.log(`Admins: ${admin.length}`);
    console.log(`WatchProgress: ${wpCount}`);
    console.log(`Favoritos de usuario-anime: ${favCount}`);
    console.log(`Notas de anime-usuario: ${notaCount}`);
    console.log(`PersonagemFavorito: ${personagemFavCount}`);
    console.log(`RankingUsuario: ${rankingCount}`);
    console.log(`CacheAnime: ${cacheCount}`);
    console.log(`Filtro: ${filtroCount}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro ao checar seed de usuários:', msg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
