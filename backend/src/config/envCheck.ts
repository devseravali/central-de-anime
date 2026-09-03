const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MAIL_FROM',
  'SMTP_HOST',
  'SMTP_USER',
];

export function checkCriticalEnv(): void {
  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
   
    console.warn(`[env-check] Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[env-check] Todas as variáveis críticas presentes');
    }
  }
}

export default checkCriticalEnv;
