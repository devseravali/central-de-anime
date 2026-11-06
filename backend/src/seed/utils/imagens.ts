import fs from 'node:fs';
import path from 'node:path';
import { backendRoot } from './caminhos';
import { SeedInputError, type SeedReport } from './relatorio';

const capaAliases: Record<string, string> = {
  'kimetsu-no-yaiba-mugen-t2.jpg': 'kimestu-no-yaiba-t2.jpg',
  'kimetsu-no-yaiba-t4.jpg': 'kimestu-no-yaiba-t4.jpg',
  'kimetsu-no-yaiba-t5.jpg': 'kimestu-no-yaiba-t5.jpg',
  'kimetsu-no-yaiba-filme-1-akaza-sairai.jpg': 'kimestu-no-yaiba-filme-1-akaza-sairai.jpg',
  'jujutsu-kaisen-inventario-oculto.jpg': 'jujutsu-kaisen-kaigyoku-gyokusetsu.jpg',
  'jujutsu-kaisen-incidente-de-shibuya.jpg': 'jujutsu-kaisen-shibuya-x-shimetsu.jpg',
  'made-in-abyss-the-retsujitsu-no-ougonkyou.jpg': 'made-in-abyss-retsujitsu-no-ougonkyou.jpg',
};

export function inspectLocalImage(relative: string): {
  estado: 'presente' | 'ausente' | 'caixa-divergente';
  caminhoFisico?: string;
} {
  let current = backendRoot;
  const actual: string[] = [];
  let divergent = false;
  for (const segment of relative.split('/')) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) return { estado: 'ausente' };
    const entries = fs.readdirSync(current);
    const matches = entries.filter(entry => entry.toLowerCase() === segment.toLowerCase());
    const found = entries.includes(segment) ? segment : matches.length === 1 ? matches[0] : undefined;
    if (!found) return { estado: 'ausente' };
    divergent ||= found !== segment;
    actual.push(found);
    current = path.join(current, found);
  }
  if (!fs.statSync(current).isFile()) return { estado: 'ausente' };
  return { estado: divergent ? 'caixa-divergente' : 'presente', caminhoFisico: actual.join('/') };
}

export function normalizeImage(
  value: string | null,
  report: SeedReport,
  recordId: number,
  cover = false,
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
  let relative = value.replace(/\\/g, '/').replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
  if (!relative.startsWith('images/') || relative.split('/').some(part => part === '..' || part === '.')) {
    throw new SeedInputError(`${report.modulo} id=${recordId}: caminho de imagem invalido.`);
  }
  if (cover) {
    const parts = relative.split('/');
    const filename = parts.pop()!;
    const naruto = filename.match(/^naruto-shippuden(?:-t)?(\d+)\.jpg$/i);
    parts.push(capaAliases[filename] ?? (naruto ? `naruto-shippuden-t${naruto[1]}.jpg` : filename));
    relative = parts.join('/');
  }
  const inspected = inspectLocalImage(relative);
  if (inspected.estado !== 'presente') {
    report.avisos.push(`id=${recordId}: imagem ${inspected.estado}: ${relative}` +
      (inspected.caminhoFisico ? `; caminho fisico: ${inspected.caminhoFisico}` : ''));
  }
  return relative;
}
