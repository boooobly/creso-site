import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { sanitizeUploadFileName, validateUploadedImageFile } from '@/lib/file-validation';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_ADMIN_UPLOAD_FOLDERS = new Set(['site', 'portfolio', 'orders', 'temp']);
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function mapUploadValidationError(error: 'File too large' | 'Invalid file type' | 'Invalid file content'): string {
  if (error === 'File too large') {
    return 'Размер файла не должен превышать 10 МБ.';
  }

  if (error === 'Invalid file content') {
    return 'Файл повреждён или не является корректным изображением.';
  }

  return 'Можно загружать только изображения JPG, PNG, WEBP, GIF или AVIF.';
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Файл не выбран.' }, { status: 400 });
  }

  const folder = String(formData.get('folder') ?? 'site').trim() || 'site';
  if (!ALLOWED_ADMIN_UPLOAD_FOLDERS.has(folder)) {
    return NextResponse.json({ ok: false, error: 'Недопустимая папка для загрузки.' }, { status: 400 });
  }

  const validation = await validateUploadedImageFile({
    file,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
    maxBytes: MAX_UPLOAD_SIZE_BYTES,
    rejectSvg: true,
  });

  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: mapUploadValidationError(validation.error) }, { status: 400 });
  }

  const cleanName = sanitizeUploadFileName(file.name, 'admin-image.bin');
  const pathname = `uploads/${folder}/${Date.now()}-${cleanName}`;

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      sizeBytes: file.size,
      mimeType: file.type,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить изображение.' }, { status: 500 });
  }
}
