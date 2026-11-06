import pg from 'pg';
import { parseIntoClientConfig } from 'pg-connection-string';
import { loadEnvironment } from '../src/config/environment';
import { InspectionError, stagingInspectionConfig, runStagingInspection } from './controlled-inspection';

try {
  if (process.env.NODE_OPTIONS) {
    throw new InspectionError('configuration', 'NODE_OPTIONS', 'INSPECTION_VALIDATION_FAILED', 'NODE_OPTIONS herdado nao permitido.');
  }
  if (process.argv.slice(2).length) {
    throw new InspectionError('configuration', 'arguments', 'INSPECTION_VALIDATION_FAILED', 'Argumentos nao permitidos.');
  }
  const policy = loadEnvironment();
  const url = policy.values.DATABASE_URL;
  if (!url) {
    throw new InspectionError('configuration', 'DATABASE_URL', 'INSPECTION_VALIDATION_FAILED', 'DATABASE_URL obrigatoria.');
  }
  const connection = parseIntoClientConfig(url);
  const config = stagingInspectionConfig(policy, connection, []);
  await runStagingInspection(new pg.Client(config), pg.types, message => console.info(message), connection.user ?? '');
} catch (error) {
  console.error(JSON.stringify(error instanceof InspectionError
    ? { stage: error.stage, field: error.field, code: error.code, message: error.message }
    : {
      stage: 'configuration', field: 'environment', code: 'INSPECTION_CONFIGURATION_FAILED',
      message: 'Falha ao preparar inspecao staging; detalhes externos omitidos.',
    }));
  process.exitCode = 1;
}
