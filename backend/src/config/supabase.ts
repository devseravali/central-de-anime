export type SupabaseDestination = {
  SUPABASE_PROJECT_REF?: string;
  SUPABASE_POOLER_HOST?: string;
};

export function assertSupabaseDestination(url: URL, values: SupabaseDestination, administrative: boolean): void {
  const project = values.SUPABASE_PROJECT_REF;
  if (!project || !/^[a-z0-9]{20}$/.test(project)) {
    throw new Error('SUPABASE_PROJECT_REF explicito e valido obrigatorio.');
  }
  if (url.pathname !== '/postgres') throw new Error('Database de producao deve ser postgres.');
  if (url.searchParams.get('sslmode') !== 'verify-full') throw new Error('Producao exige TLS verify-full.');
  const port = url.port || '5432';
  if (url.hostname === `db.${project}.supabase.co`) {
    if (port !== '5432' || decodeURIComponent(url.username) !== 'postgres') {
      throw new Error('Endpoint direto ou role de producao divergente.');
    }
    return;
  }
  const pooler = values.SUPABASE_POOLER_HOST;
  if (!pooler || !/^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(pooler) ||
      url.hostname !== pooler || decodeURIComponent(url.username) !== `postgres.${project}`) {
    throw new Error('Producao exige endpoint e projeto Supabase autorizados.');
  }
  if (!['5432', '6543'].includes(port) || (administrative && port !== '5432')) {
    throw new Error('Administracao exige conexao direta ou pooler de sessao; pooler transacional bloqueado.');
  }
}
