import { loadEnvironment } from '../src/config/environment';

try {
  const selected = loadEnvironment();
  console.info({
    environment: selected.environment,
    host: selected.urls.application.hostname,
    port: selected.urls.application.port || '5432',
    database: selected.urls.application.pathname.slice(1),
    readOnly: selected.readOnly,
    databaseConnection: 'not-opened',
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha ao validar ambiente.');
  process.exitCode = 1;
}
