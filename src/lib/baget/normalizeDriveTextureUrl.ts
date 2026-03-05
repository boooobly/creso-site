export function normalizeDriveTextureUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const hostname = parsed.hostname.toLowerCase();
  const isDriveHost = hostname === 'drive.google.com' || hostname === 'docs.google.com' || hostname === 'drive.usercontent.google.com';
  if (!isDriveHost) return trimmed;

  const idFromPath = parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1]?.trim();
  const idFromQuery = parsed.searchParams.get('id')?.trim();
  const fileId = idFromPath || idFromQuery;

  if (!fileId) return trimmed;

  return `https://drive.usercontent.google.com/uc?id=${encodeURIComponent(fileId)}&export=download`;
}
