import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const filePath = fileURLToPath(import.meta.url);
const dir = dirname(filePath);
const projectRoot = resolve(dir, '..', '..');
const envFileName = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = resolve(projectRoot, envFileName);

config({ path: envPath });
