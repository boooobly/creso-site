import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Файл не выбран.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, error: 'Можно загружать только изображения.' }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: 'Размер файла не должен превышать 10 МБ.' }, { status: 400 });
  }

  const folder = String(formData.get('folder') ?? 'site').trim() || 'site';
  const cleanName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
  const pathname = `uploads/${folder}/${Date.now()}-${cleanName}`;

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      sizeBytes: file.size,
      mimeType: file.type,
      fileName: file.name
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить изображение.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
