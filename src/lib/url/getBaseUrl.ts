export function getBaseUrl(): string {
  const fromEnv = process.env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000';
}
