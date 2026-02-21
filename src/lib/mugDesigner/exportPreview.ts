export async function dataUrlToFile(dataUrl: string, filename: string, type = 'image/png'): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || type });
}
