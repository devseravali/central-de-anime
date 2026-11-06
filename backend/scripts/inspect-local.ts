import pg from 'pg';
import { parseIntoClientConfig } from 'pg-connection-string';
import { loadEnvironment } from '../src/config/environment';
import { InspectionError, inspectionConfig, runInspection } from './controlled-inspection';

try {
  if (process.env.NODE_OPTIONS) {
    throw new InspectionError('configuration', 'NODE_OPTIONS', 'INSPECTION_VALIDATION_FAILED', 'NODE_OPTIONS herdado nao permitido.');
  }
  const policy = loadEnvironment();
  const url = policy.values.DATABASE_URL;
  if (!url) {
    throw new InspectionError('configuration', 'DATABASE_URL', 'INSPECTION_VALIDATION_FAILED', 'DATABASE_URL obrigatoria.');
  }
  const connection = parseIntoClientConfig(url);
  const config = inspectionConfig(policy, connection, process.argv.slice(2));
  await runInspection(new pg.Client(config), pg.types, config.host, message => console.info(message), connection.user ?? '');
} catch (error) {
  if (error instanceof InspectionError) {
    console.error(JSON.stringify({ stage: error.stage, field: error.field, code: error.code, message: error.message }));
  } else {
    console.error(JSON.stringify({
      stage: 'configuration', field: 'environment', code: 'INSPECTION_CONFIGURATION_FAILED',
      message: 'Falha ao preparar inspecao; detalhes externos omitidos.',
    }));
  }
  process.exitCode = 1;
}
