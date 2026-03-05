export function normalizeBagetTextureUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const httpIndex = trimmed.search(/https?:\/\//i);
  if (httpIndex === -1) return '';

  const fromProtocol = trimmed.slice(httpIndex);
  const firstToken = fromProtocol.split(/\s+/)[0] ?? '';
  const nextProtocolIndex = firstToken.slice(8).search(/https?:\/\//i);
  const rawUrl = (nextProtocolIndex >= 0
    ? firstToken.slice(0, nextProtocolIndex + 8)
    : firstToken
  ).trim();

  if (!rawUrl) return '';

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return '';
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'drive.usercontent.google.com') return parsed.toString();

  if (hostname === 'drive.google.com' || hostname === 'docs.google.com') {
    const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const idFromPath = pathMatch?.[1]?.trim();
    const idFromQuery = parsed.searchParams.get('id')?.trim();
    const fileId = idFromPath || idFromQuery;

    if (!fileId) return '';

    return `https://drive.usercontent.google.com/uc?id=${encodeURIComponent(fileId)}&export=download`;
  }

  return parsed.toString();
}
