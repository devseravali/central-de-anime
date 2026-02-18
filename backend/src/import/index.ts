async function runSeed() {

  await import('./importStatus');
  const { importEstudios } = await import('./importEstudios');
  await importEstudios();
  await import('./importGeneros');
  await import('./importEstacoes');
  await import('./importPlataformas');
  await import('./importTags');
  await import('./importPersonagens');
  const { importAnimes } = await import('./importAnimes');
  await importAnimes();

  await import('./importAnimeEstacao');
  await import('./importAnimeEstudio');
  await import('./importAnimeGenero');
  await import('./importAnimePlataforma');
  await import('./importAnimeStatus');
  await import('./importAnimeTag');
  await import('./importAnimePersonagem');

  console.log('✅ Seed executado com sucesso');
}

runSeed();
