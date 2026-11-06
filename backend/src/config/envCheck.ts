const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'MAIL_FROM',
];

export function checkCriticalEnv(): void {
  const missing: string[] = [];
  const keys = process.env.APP_ENV === 'production' || !process.env.APP_ENV
    ? [...required, 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']
    : required;
  for (const key of keys) {
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
