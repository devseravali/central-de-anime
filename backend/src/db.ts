import './config/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const isTest = process.env.NODE_ENV === 'test';
const connectionString = isTest
  ? process.env.DATABASE_TEST_URL
  : process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Database connection string not configured.');
}
console.log('Conectando ao banco:', connectionString);

export const pool = new Pool({ connectionString });
export const db = drizzle(pool);
