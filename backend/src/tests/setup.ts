import { vi } from 'vitest';
import { loadEnvironment } from '../config/environment';

loadEnvironment();

vi.mock('pg', () => {
  class DisabledDatabaseConnection {
    constructor() {
      throw new Error('Testes sem banco: conexoes PostgreSQL reais estao bloqueadas.');
    }
  }
  return {
    default: { Pool: DisabledDatabaseConnection, Client: DisabledDatabaseConnection },
    Pool: DisabledDatabaseConnection,
    Client: DisabledDatabaseConnection,
  };
});
