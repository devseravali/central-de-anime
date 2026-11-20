import fs from 'node:fs';
import path from 'node:path';
import { backendRoot } from './caminhos';
import { SeedInputError, type SeedReport } from './relatorio';

export function inspectLocalImage(relative: string, directoryEntries?: Map<string, string[]>): {
  estado: 'presente' | 'ausente' | 'caixa-divergente';
  caminhoFisico?: string;
} {
  if (!relative.startsWith('images/') ||
      relative.split('/').some(part => !part || part === '..' || part === '.') ||
      relative.includes('\\') || relative.includes('\0')) {
    throw new SeedInputError('Caminho de imagem invalido.');
  }
  let current = backendRoot;
  const actual: string[] = [];
  let divergent = false;
  for (const segment of relative.split('/')) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) return { estado: 'ausente' };
    let entries = directoryEntries?.get(current);
    if (!entries) {
      entries = fs.readdirSync(current);
      directoryEntries?.set(current, entries);
    }
    const matches = entries.filter(entry => entry.toLowerCase() === segment.toLowerCase());
    const found = entries.includes(segment) ? segment : matches.length === 1 ? matches[0] : undefined;
    if (!found) return { estado: 'ausente' };
    divergent ||= found !== segment;
    actual.push(found);
    current = path.join(current, found);
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new SeedInputError('Link simbolico em caminho de imagem proibido.');
    }
  }
  if (!fs.statSync(current).isFile()) return { estado: 'ausente' };
  return { estado: divergent ? 'caixa-divergente' : 'presente', caminhoFisico: actual.join('/') };
}

export function resolveImagePath(
  value: string | null,
  report: SeedReport,
  recordId: number,
  directoryEntries?: Map<string, string[]>,
): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new SeedInputError(`${report.modulo} id=${recordId}: imagem com origem loopback proibida.`);
    }
    if (url.username || url.password) {
      throw new SeedInputError(`${report.modulo} id=${recordId}: imagem com credenciais proibida.`);
    }
    return value;
  }
  if (path.win32.isAbsolute(value) || path.posix.isAbsolute(value)) {
    throw new SeedInputError(`${report.modulo} id=${recordId}: caminho de imagem invalido.`);
  }
  const relative = value.replace(/\\/g, '/').replace(/^(?:\.\.\/)+/, '');
  if (!relative.startsWith('images/') ||
      relative.split('/').some(part => !part || part === '..' || part === '.') ||
      relative.includes('\0')) {
    throw new SeedInputError(`${report.modulo} id=${recordId}: caminho de imagem invalido.`);
  }
  const inspected = inspectLocalImage(relative, directoryEntries);
  if (inspected.estado !== 'presente') {
    report.avisos.push(`id=${recordId}: imagem ${inspected.estado}: ${relative}` +
      (inspected.caminhoFisico ? `; caminho fisico: ${inspected.caminhoFisico}` : ''));
  }
  return relative;
}
