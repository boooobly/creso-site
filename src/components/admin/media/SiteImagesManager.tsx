'use client';

import { useEffect, useMemo, useState } from 'react';

type MediaAsset = {
  id: string;
  title: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

type FormState = {
  title: string;
  altText: string;
  sortOrder: number;
  imageUrl: string;
};

const emptyForm: FormState = { title: '', altText: '', sortOrder: 0, imageUrl: '' };

export default function SiteImagesManager() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/admin/media?scope=site&page=1&pageSize=100', { cache: 'no-store' });
    const json = (await response.json()) as { ok: boolean; items?: MediaAsset[]; error?: string };

    if (!response.ok || !json.ok) {
      setError(json.error ?? 'Не удалось загрузить изображения.');
      setLoading(false);
      return;
    }

    setItems(json.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  useEffect(() => {
    if (!editing) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: editing.title,
      altText: editing.altText ?? '',
      sortOrder: editing.sortOrder,
      imageUrl: editing.url
    });
  }, [editing]);

  const formTitle = useMemo(() => (editing ? 'Редактирование изображения' : 'Добавить изображение сайта'), [editing]);

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'site');

    const response = await fetch('/api/admin/upload-image', { method: 'POST', body: data });
    const json = (await response.json()) as { ok: boolean; url?: string; error?: string };

    if (!response.ok || !json.ok || !json.url) {
      setUploading(false);
      setError(json.error ?? 'Ошибка загрузки файла.');
      return;
    }

    setForm((prev) => ({ ...prev, imageUrl: json.url ?? prev.imageUrl }));
    setUploading(false);
  }

  async function saveItem() {
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      title: form.title,
      kind: 'image',
      scope: 'site',
      url: form.imageUrl,
      altText: form.altText || undefined,
      sortOrder: form.sortOrder,
      isActive: true
    };

    const response = await fetch(editing ? `/api/admin/media/${editing.id}` : '/api/admin/media', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setSaving(false);
      setError(json.error ?? 'Не удалось сохранить запись.');
      return;
    }

    setMessage(editing ? 'Изображение обновлено.' : 'Изображение добавлено.');
    setEditing(null);
    setForm(emptyForm);
    await loadItems();
    setSaving(false);
  }

  async function removeItem(item: MediaAsset) {
    if (!window.confirm(`Удалить изображение «${item.title}»?`)) return;

    const response = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' });
    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setError(json.error ?? 'Не удалось удалить изображение.');
      return;
    }

    setMessage('Изображение удалено.');
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Изображения для разделов сайта</h2>
        <p className="mt-1 text-sm text-slate-600">
          Здесь хранятся изображения для баннеров, карточек и иллюстраций. Это отдельный раздел, не для портфолио работ.
        </p>

        {message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{formTitle}</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Название</label>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                placeholder="Например: Главный баннер на главной"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Описание для SEO (alt)</label>
              <input
                value={form.altText}
                onChange={(event) => setForm((prev) => ({ ...prev, altText: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                placeholder="Кратко, что на изображении"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Порядок</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Изображение</label>
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Предпросмотр" className="h-40 w-full rounded-lg border border-slate-200 object-cover" />
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">Изображение пока не выбрано.</p>
              )}
              <label className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                {uploading ? 'Загружаем...' : form.imageUrl ? 'Заменить изображение' : 'Загрузить изображение'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadImage(file);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveItem()}
                disabled={saving || uploading || !form.title.trim() || !form.imageUrl}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              {editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700"
                >
                  Отменить
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Список изображений</h3>
            {loading ? <p className="text-sm text-slate-500">Загрузка...</p> : null}
            {!loading && items.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Пока нет изображений. Добавьте первое изображение для сайта.</p>
            ) : null}

            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.altText ?? item.title} className="h-32 w-full rounded-lg object-cover" />
                  <h4 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500">Порядок: {item.sortOrder}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeItem(item)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
