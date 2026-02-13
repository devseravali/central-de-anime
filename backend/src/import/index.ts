async function runSeed() {
  // Limpar o banco antes de importar os dados
  const { resetDb } = await import('./resetDb.js');
  await resetDb();
  // Entidades primeiro

  await import('./importStatus');
  const { importEstudios } = await import('./importEstudios');
  await importEstudios();
  await import('./importGeneros');
  await import('./importEstacoes');
  await import('./importPlataformas');
  await import('./importTags');
  await import('./importPersonagens');
  const { importAnimes } = await import('./importAnimes.js');
  await importAnimes();
  await import('./importTemporadas');

  // Relacionamentos (todos após entidades)
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
