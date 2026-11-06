import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const dataRoot = path.join(backendRoot, 'data');

export function isDirectExecution(moduleUrl: string): boolean {
  return Boolean(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(moduleUrl));
}
