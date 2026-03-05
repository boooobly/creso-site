const FILE_ID_PATTERN = /[A-Za-z0-9_-]{20,}/;

export function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const pathMatch = trimmed.match(/\/file\/d\/([A-Za-z0-9_-]{20,})/);
  if (pathMatch?.[1] && FILE_ID_PATTERN.test(pathMatch[1])) {
    return pathMatch[1];
  }

  const idMatch = trimmed.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (idMatch?.[1] && FILE_ID_PATTERN.test(idMatch[1])) {
    return idMatch[1];
  }

  return null;
}

export function buildDriveDirectImageCandidates(fileId: string): string[] {
  return [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];
}
