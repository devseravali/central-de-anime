import { seedUsers } from '../src/seed/Users';
import { prisma } from '../src/config/prisma';

async function main() {
  try {
    await seedUsers();

    const episodio = await prisma.episodio.findUnique({ where: { id: 10 } });
    const anime = await prisma.anime.findUnique({ where: { id: 5 } });

    let targetEpisodio = episodio;
    if (!targetEpisodio) {
      if (!anime) {
        console.warn('Nenhum anime encontrado para criar episódio de teste — pulando criação de WatchProgress.');
      } else {
        let season = await prisma.temporada.findFirst();
        if (!season) {
          season = await prisma.temporada.create({ data: { nome: 'Seed Temporada' } });
        }

        targetEpisodio = await prisma.episodio.create({
          data: {
            numero: 1,
            titulo: 'Episódio de Seed (teste)',
            temporadaId: season.id,
            animeId: anime.id,
            sinopse: 'Episódio criado automaticamente para testes de seed',
          },
        });
      }
    }

    if (!targetEpisodio) {
      console.warn('Nenhum episódio disponível para criar WatchProgress — pulando esta etapa.');
    } else {
      const users = await prisma.usuario.findMany();
      for (const u of users) {
        try {
          const existing = await prisma.watchProgress.findFirst({ where: { usuarioId: u.id, episodioId: targetEpisodio.id } });
          if (!existing) {
            await prisma.watchProgress.create({
              data: { usuarioId: u.id, episodioId: targetEpisodio.id, assistido: false, segundosAssistidos: 0, porcentagem: 0 },
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`Falha ao criar WatchProgress para usuarioId=${u.id}:`, msg);
        }
      }
    }

    const personagens = await prisma.personagem.findMany({ take: 1 });
    if (personagens.length > 0) {
      const firstPersonagem = personagens[0];
      const users = await prisma.usuario.findMany();
      for (const u of users) {
        try {
          const exists = await prisma.personagemFavorito.findFirst({ where: { usuarioId: u.id, personagemId: firstPersonagem.id } });
          if (!exists) {
            await prisma.personagemFavorito.create({ data: { usuarioId: u.id, personagemId: firstPersonagem.id } });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`Falha ao criar PersonagemFavorito para usuarioId=${u.id}:`, msg);
        }
      }
    } else {
      console.warn('Nenhum personagem encontrado — pulando PersonagemFavorito.');
    }

    const usersForRank = await prisma.usuario.findMany();
    for (const u of usersForRank) {
      try {
        const exists = await prisma.rankingUsuario.findUnique({ where: { usuarioId: u.id } });
        if (!exists) {
          await prisma.rankingUsuario.create({ data: { usuarioId: u.id, pontos: 0, nivel: 1, totalEpisodiosAssistidos: 0 } });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Falha ao criar RankingUsuario para usuarioId=${u.id}:`, msg);
      }
    }

    const exampleAnime = await prisma.anime.findFirst();
    if (exampleAnime) {
      try {
        const exists = await prisma.cacheAnime.findUnique({ where: { animeId: exampleAnime.id } });
        if (!exists) {
          await prisma.cacheAnime.create({ data: { animeId: exampleAnime.id, viewsCount: 0, likesCount: 0, rankingScore: 0 } });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Falha ao criar CacheAnime exemplo:', msg);
      }
    } else {
      console.warn('Nenhum anime encontrado — pulando CacheAnime.');
    }

    const filtros = ['populares', 'novos', 'mais_avaliados'];
    for (const nome of filtros) {
      try {
        const exists = await prisma.filtro.findFirst({ where: { nome } });
        if (!exists) {
          await prisma.filtro.create({ data: { nome, valor: nome } });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Falha ao criar filtro ${nome}:`, msg);
      }
    }

    console.log('Seed de usuários e engajamento (exemplos) concluído.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro no seed de usuários:', msg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();