'use client';

import { useMemo, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AdminAlert, AdminButton } from '@/components/admin/ui';

type GalleryImageValue = {
  url: string;
  assetId?: string;
};

type PortfolioFormValues = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  coverImage: string;
  coverImageAssetId: string;
  galleryImages: GalleryImageValue[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

type PortfolioFormProps = {
  heading: string;
  description: string;
  initialValues: PortfolioFormValues;
  submitLabel: string;
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
};

type UploadedImage = {
  url: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
};

type GalleryImage = {
  id: string;
  url: string;
  assetId?: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeInitialGallery(values: PortfolioFormValues): GalleryImage[] {
  const normalized: GalleryImage[] = [];

  if (values.coverImage) {
    normalized.push({ id: makeId(), url: values.coverImage, assetId: values.coverImageAssetId || undefined });
  }

  for (const image of values.galleryImages) {
    const url = String(image?.url ?? '').trim();
    if (!url || normalized.some((entry) => entry.url === url)) continue;
    normalized.push({ id: makeId(), url, assetId: image.assetId?.trim() || undefined });
  }

  return normalized;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant="primary" className="px-4 py-2.5" disabled={pending}>
      {pending ? 'Сохраняем...' : label}
    </AdminButton>
  );
}

export default function PortfolioForm({ heading, description, initialValues, submitLabel, action }: PortfolioFormProps) {
  const [state, formAction] = useFormState(action, {});
  const initialGallery = useMemo(() => normalizeInitialGallery(initialValues), [initialValues]);

  const [gallery, setGallery] = useState<GalleryImage[]>(() => initialGallery);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(() => initialGallery[0]?.id ?? null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const primaryImage = useMemo(() => gallery.find((image) => image.id === primaryImageId) ?? gallery[0], [gallery, primaryImageId]);

  const galleryPayload = useMemo(
    () =>
      JSON.stringify(
        gallery.map((image) => ({
          url: image.url,
          ...(image.assetId ? { assetId: image.assetId } : {})
        }))
      ),
    [gallery]
  );

  async function uploadFile(file: File) {
    setUploadState('uploading');
    setUploadError('');

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'portfolio');

    const uploadResponse = await fetch('/api/admin/upload-image', { method: 'POST', body: data });
    const uploadJson = (await uploadResponse.json()) as ({ ok: true } & UploadedImage) | { ok: false; error?: string };

    if (!uploadResponse.ok || !uploadJson.ok) {
      setUploadState('error');
      setUploadError('error' in uploadJson ? (uploadJson.error ?? 'Не удалось загрузить файл в хранилище.') : 'Не удалось загрузить файл в хранилище.');
      return;
    }

    const createAssetResponse = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name,
        kind: 'image',
        scope: 'portfolio',
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

    const nextImage = {
      id: makeId(),
      url: uploadJson.url,
      assetId: createAssetResponse.ok && assetJson.ok ? assetJson.item.id : undefined
    };

    setGallery((prev) => {
      if (prev.some((entry) => entry.url === nextImage.url)) {
        return prev;
      }

      const next = [...prev, nextImage];
      if (!primaryImageId) {
        setPrimaryImageId(nextImage.id);
      }

      return next;
    });

    if (!createAssetResponse.ok || !assetJson.ok) {
      setUploadState('error');
      setUploadError(
        'error' in assetJson
          ? (assetJson.error ?? 'Изображение загружено, но медиа-запись не создана. Сохранение кейса создаст её автоматически.')
          : 'Изображение загружено, но медиа-запись не создана. Сохранение кейса создаст её автоматически.'
      );
      return;
    }

    setUploadState('idle');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="coverImage" value={primaryImage?.url ?? ''} />
        <input type="hidden" name="coverImageAssetId" value={primaryImage?.assetId ?? ''} />
        <input type="hidden" name="galleryImages" value={galleryPayload} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Название
            </label>
            <input
              id="title"
              name="title"
              defaultValue={initialValues.title}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Например: Вывеска для кофейни"
              onChange={(event) => {
                const slugInput = document.getElementById('slug') as HTMLInputElement | null;
                if (slugInput && !slugInput.value.trim()) {
                  slugInput.value = slugify(event.currentTarget.value);
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-slate-700">
              URL-имя (слаг)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={initialValues.slug}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Если оставить пустым — заполнится автоматически"
            />
            <p className="text-xs text-slate-500">Используется в ссылке. Лучше латиницей, например: vyveska-kofeynya.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-700">
              Категория
            </label>
            <input
              id="category"
              name="category"
              defaultValue={initialValues.category}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Например: Наружная реклама"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="shortDescription" className="text-sm font-medium text-slate-700">
              Описание
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialValues.shortDescription}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Кратко опишите, что было сделано для клиента"
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Галерея кейса</p>
              <p className="text-xs text-slate-500">Загрузите несколько изображений, выберите главное и при необходимости поменяйте порядок.</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadState === 'uploading'}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  {uploadState === 'uploading' ? 'Загружаем...' : 'Добавить изображения'}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  for (const file of files) {
                    // eslint-disable-next-line no-await-in-loop
                    await uploadFile(file);
                  }
                  event.currentTarget.value = '';
                }}
              />

              {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}

              {gallery.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {gallery.map((image, index) => {
                    const isPrimary = image.id === primaryImage?.id;

                    return (
                      <li key={image.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.url} alt={`Изображение ${index + 1}`} className="h-24 w-full rounded-md border border-slate-200 object-cover sm:w-36" />

                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="truncate text-xs text-slate-500">{image.url}</p>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryImageId(image.id)}
                                className={`rounded-md border px-2.5 py-1.5 text-xs ${
                                  isPrimary ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {isPrimary ? 'Главное изображение' : 'Сделать главным'}
                              </button>

                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => {
                                  setGallery((prev) => {
                                    const next = [...prev];
                                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                    return next;
                                  });
                                }}
                                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                              >
                                Вверх
                              </button>

                              <button
                                type="button"
                                disabled={index === gallery.length - 1}
                                onClick={() => {
                                  setGallery((prev) => {
                                    const next = [...prev];
                                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                    return next;
                                  });
                                }}
                                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                              >
                                Вниз
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setGallery((prev) => {
                                    const next = prev.filter((entry) => entry.id !== image.id);
                                    if (!next.some((entry) => entry.id === primaryImageId)) {
                                      setPrimaryImageId(next[0]?.id ?? null);
                                    }
                                    return next;
                                  });
                                }}
                                className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Добавьте хотя бы одно изображение, чтобы кейс выглядел полноценно в каталоге.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sortOrder" className="text-sm font-medium text-slate-700">
              Порядок
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={initialValues.sortOrder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-col justify-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="published" defaultChecked={initialValues.published} className="h-4 w-4" />
              Показывать на сайте
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="featured" defaultChecked={initialValues.featured} className="h-4 w-4" />
              Показать как избранную работу
            </label>
          </div>
        </div>

        {state.error ? <AdminAlert tone="error">{state.error}</AdminAlert> : null}

        <div className="flex items-center justify-end">
          <SubmitButton label={submitLabel} />
        </div>
      </form>
    </section>
  );
}
