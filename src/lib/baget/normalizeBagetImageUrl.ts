export function normalizeBagetImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const hostname = parsed.hostname.toLowerCase();
  const isGoogleDriveHost = hostname === 'drive.google.com' || hostname === 'docs.google.com';
  if (!isGoogleDriveHost) return trimmed;

  const idFromQuery = parsed.searchParams.get('id')?.trim();
  if (idFromQuery) {
    return `https://drive.usercontent.google.com/uc?id=${encodeURIComponent(idFromQuery)}&export=download`;
  }

  const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
  const idFromPath = pathMatch?.[1]?.trim();
  if (idFromPath) {
    return `https://drive.usercontent.google.com/uc?id=${encodeURIComponent(idFromPath)}&export=download`;
  }

  return trimmed;
}
