export function assertPrismaArguments(args) {
  for (const argument of args) {
    const option = argument.split('=', 1)[0].toLowerCase();
    if (option === '-c' || (option.startsWith('--') && (option === '--url' || option.endsWith('-url') ||
        option === '--config' || option === '--schema' ||
        option.startsWith('--from-') || option.startsWith('--to-')))) {
      throw new Error('Substituicao de datasource ou configuracao Prisma bloqueada nos comandos do projeto.');
    }
  }
}
