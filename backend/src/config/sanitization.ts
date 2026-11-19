export function administrativeSecrets(env: NodeJS.ProcessEnv = process.env): string[] {
  const secrets: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    if (/PASSWORD|PASS$|TOKEN|SECRET|API_KEY|DATABASE_URL/.test(key)) secrets.push(value);
    if (/DATABASE_URL/.test(key)) {
      const encoded = value.match(/^[a-z]+:\/\/[^:\/]*:([^@]*)@/i)?.[1];
      if (encoded) {
        secrets.push(encoded);
        try {
          secrets.push(decodeURIComponent(encoded));
        } catch {
          // Keep the encoded value redacted even for malformed credentials.
        }
      }
    }
  }
  return secrets;
}

export function sanitizeAdministrativeText(text: string, secrets: readonly string[] = administrativeSecrets()): string {
  let safe = text.replace(/[\u0000-\u001f\u007f]/g, ' ');
  for (const secret of secrets.filter(value => value.length > 0).sort((a, b) => b.length - a.length)) {
    safe = safe.split(secret).join('[omitido]');
  }
  return safe
    .replace(/(?:postgres(?:ql)?|https?):\/\/[^\s]+/gi, '[url omitida]')
    .replace(/\b(password|passwd|senha|token|secret|api[_-]?key|authorization|credential)[^\s:=]*\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1=[omitido]');
}
