'use client';

import { useRef, useState } from 'react';

type UploadedImage = {
  url: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
};

type ImageUploadFieldProps = {
  label: string;
  folder: 'portfolio' | 'site';
  name: string;
  assetIdName?: string;
  initialUrl?: string;
  initialAssetId?: string;
  hint?: string;
};

export default function ImageUploadField({
  label,
  folder,
  name,
  assetIdName,
  initialUrl,
  initialAssetId,
  hint
}: ImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? '');
  const [assetId, setAssetId] = useState(initialAssetId ?? '');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onUploadFile(file: File) {
    setUploadState('uploading');
    setErrorMessage('');

    const data = new FormData();
    data.append('file', file);
    data.append('folder', folder);

    const uploadResponse = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: data
    });

    const uploadJson = (await uploadResponse.json()) as
      | ({ ok: true } & UploadedImage)
      | { ok: false; error?: string };

    if (!uploadResponse.ok || !uploadJson.ok) {
      setUploadState('error');
      setErrorMessage('error' in uploadJson ? (uploadJson.error ?? 'Не удалось загрузить файл.') : 'Не удалось загрузить файл.');
      return;
    }

    const createAssetResponse = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name,
        kind: 'image',
        scope: folder,
        url: uploadJson.url,
        fileName: uploadJson.fileName,
        mimeType: uploadJson.mimeType,
        sizeBytes: uploadJson.sizeBytes,
        altText: '',
        sortOrder: 0,
        isActive: true
      })
    });

    const assetJson = (await createAssetResponse.json()) as
      | { ok: true; item: { id: string; url: string } }
      | { ok: false; error?: string };

    if (!createAssetResponse.ok || !assetJson.ok) {
      setUploadState('error');
      setErrorMessage('error' in assetJson ? (assetJson.error ?? 'Файл загружен, но не удалось создать запись изображения.') : 'Файл загружен, но не удалось создать запись изображения.');
      setImageUrl(uploadJson.url);
      return;
    }

    setImageUrl(assetJson.item.url);
    setAssetId(assetJson.item.id);
    setUploadState('idle');
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input type="hidden" name={name} value={imageUrl} />
      {assetIdName ? <input type="hidden" name={assetIdName} value={assetId} /> : null}

      <div className="rounded-lg border border-slate-200 p-3">
        {imageUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Предпросмотр изображения" className="h-44 w-full rounded-lg border border-slate-200 object-cover sm:w-80" />
            <p className="text-xs text-slate-500 break-all">{imageUrl}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Изображение пока не выбрано.</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadState === 'uploading'}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {imageUrl ? 'Заменить изображение' : 'Загрузить изображение'}
          </button>
          {imageUrl ? (
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setAssetId('');
              }}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Удалить
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void onUploadFile(file);
            event.currentTarget.value = '';
          }}
        />

        {uploadState === 'uploading' ? <p className="mt-2 text-xs text-slate-500">Загружаем файл...</p> : null}
        {uploadState === 'error' ? <p className="mt-2 text-xs text-red-600">{errorMessage}</p> : null}
        {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}
