'use client';

import { useEffect, useMemo, useState } from 'react';
import { SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

type MediaAsset = {
  id: string;
  title: string;
  url: string;
  altText: string | null;
  description: string | null;
  fileName: string | null;
  sortOrder: number;
  scope: 'site' | 'portfolio';
};

type SlotDraft = {
  imageUrl: string;
  altText: string;
  note: string;
};

type ExtraForm = {
  title: string;
  imageUrl: string;
  altText: string;
  note: string;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
const emptyExtraForm: ExtraForm = { title: '', imageUrl: '', altText: '', note: '' };

export default function SiteImagesManager() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [slotDrafts, setSlotDrafts] = useState<Record<string, SlotDraft>>({});
  const [extraForm, setExtraForm] = useState<ExtraForm>(emptyExtraForm);
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slotItemsMap = useMemo(() => {
    const map = new Map<string, MediaAsset>();

    for (const item of items) {
      if (!item.fileName) continue;
      map.set(item.fileName, item);
    }

    return map;
  }, [items]);

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, { label: string; slots: (typeof SITE_IMAGE_SLOTS)[number][] }>();

    for (const slot of SITE_IMAGE_SLOTS) {
      const existingGroup = groups.get(slot.groupKey);
      if (existingGroup) {
        existingGroup.slots.push(slot);
        continue;
      }

      groups.set(slot.groupKey, { label: slot.groupLabel, slots: [slot] });
    }

    return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }));
  }, []);

  const extraItems = useMemo(
    () => items.filter((item) => !SITE_IMAGE_SLOTS.some((slot) => slot.key === item.fileName)),
    [items]
  );

  async function loadItems() {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/admin/media?scope=site&page=1&pageSize=200', { cache: 'no-store' });
    const json = (await response.json()) as { ok: boolean; items?: MediaAsset[]; error?: string };

    if (!response.ok || !json.ok) {
      setError(json.error ?? 'Не удалось загрузить изображения. Попробуйте обновить страницу.');
      setLoading(false);
      return;
    }

    const loadedItems = json.items ?? [];
    setItems(loadedItems);

    const nextDrafts: Record<string, SlotDraft> = {};
    for (const slot of SITE_IMAGE_SLOTS) {
      const existing = loadedItems.find((item) => item.fileName === slot.key);
      nextDrafts[slot.key] = {
        imageUrl: existing?.url ?? '',
        altText: existing?.altText ?? slot.fallbackAlt,
        note: existing?.description ?? '',
      };
    }

    setSlotDrafts(nextDrafts);
    setLoading(false);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function setSlotDraftValue(slotKey: string, patch: Partial<SlotDraft>) {
    setSlotDrafts((prev) => ({
      ...prev,
      [slotKey]: {
        imageUrl: prev[slotKey]?.imageUrl ?? '',
        altText: prev[slotKey]?.altText ?? '',
        note: prev[slotKey]?.note ?? '',
        ...patch,
      },
    }));
  }

  function validateFile(file: File) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Поддерживаются JPG, PNG, WEBP, AVIF и SVG. Выберите другой файл.');
      return false;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Размер файла не должен превышать 10 МБ.');
      return false;
    }

    return true;
  }

  async function uploadImage(file: File, key: string) {
    if (!validateFile(file)) return;

    setUploadingKey(key);
    setError(null);

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'site');

    const response = await fetch('/api/admin/upload-image', { method: 'POST', body: data });
    const json = (await response.json()) as { ok: boolean; url?: string; error?: string };

    if (!response.ok || !json.ok || !json.url) {
      setUploadingKey(null);
      setError(json.error ?? 'Ошибка загрузки файла.');
      return;
    }

    if (key === 'extra') {
      setExtraForm((prev) => ({ ...prev, imageUrl: json.url ?? prev.imageUrl }));
    } else {
      setSlotDraftValue(key, { imageUrl: json.url });
    }

    setMessage('Файл загружен. Проверьте предпросмотр и нажмите «Сохранить изменения».');
    setUploadingKey(null);
  }

  async function saveSlot(slotKey: string) {
    const slot = SITE_IMAGE_SLOTS.find((item) => item.key === slotKey);
    const draft = slotDrafts[slotKey];
    const existing = slotItemsMap.get(slotKey);

    if (!slot || !draft || !draft.imageUrl.trim()) {
      setError('Сначала загрузите изображение для этого блока.');
      return;
    }

    setSavingKey(slotKey);
    setMessage(null);
    setError(null);

    const payload = {
      title: slot.label,
      kind: 'image',
      scope: 'site',
      url: draft.imageUrl.trim(),
      altText: draft.altText.trim() || slot.fallbackAlt,
      description: draft.note.trim() || undefined,
      fileName: slot.key,
      sortOrder: 10,
      isActive: true,
    };

    const response = await fetch(existing ? `/api/admin/media/${existing.id}` : '/api/admin/media', {
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setSavingKey(null);
      setError(json.error ?? 'Не удалось сохранить изображение.');
      return;
    }

    setMessage('Изображение сохранено. На сайте обновление появится автоматически.');
    await loadItems();
    setSavingKey(null);
  }

  async function deleteSlotImage(slotKey: string) {
    const slot = SITE_IMAGE_SLOTS.find((item) => item.key === slotKey);
    const existing = slotItemsMap.get(slotKey);

    if (!slot || !existing) return;

    if (!window.confirm(`Удалить изображение «${slot.sectionLabel}» на странице «${slot.pageTitle}»? Будет возвращена стандартная картинка.`)) {
      return;
    }

    const response = await fetch(`/api/admin/media/${existing.id}`, { method: 'DELETE' });
    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setError(json.error ?? 'Не удалось удалить изображение.');
      return;
    }

    setMessage('Изображение удалено. Для блока снова используется стандартная картинка.');
    await loadItems();
  }

  async function saveExtraImage() {
    if (!extraForm.title.trim() || !extraForm.imageUrl.trim()) {
      setError('Укажите название и загрузите изображение.');
      return;
    }

    setSavingKey('extra');
    setMessage(null);
    setError(null);

    const payload = {
      title: extraForm.title.trim(),
      kind: 'image',
      scope: 'site',
      url: extraForm.imageUrl.trim(),
      altText: extraForm.altText.trim() || undefined,
      description: extraForm.note.trim() || undefined,
      sortOrder: 1000,
      isActive: true,
    };

    const response = await fetch(editingExtraId ? `/api/admin/media/${editingExtraId}` : '/api/admin/media', {
      method: editingExtraId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setSavingKey(null);
      setError(json.error ?? 'Не удалось сохранить изображение.');
      return;
    }

    setMessage(editingExtraId ? 'Карточка дополнительного изображения обновлена.' : 'Дополнительное изображение добавлено.');
    setExtraForm(emptyExtraForm);
    setEditingExtraId(null);
    await loadItems();
    setSavingKey(null);
  }

  function startEditExtra(item: MediaAsset) {
    setEditingExtraId(item.id);
    setExtraForm({
      title: item.title,
      imageUrl: item.url,
      altText: item.altText ?? '',
      note: item.description ?? '',
    });
  }

  async function deleteExtra(item: MediaAsset) {
    if (!window.confirm(`Удалить дополнительное изображение «${item.title}»?`)) return;

    const response = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' });
    const json = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !json.ok) {
      setError(json.error ?? 'Не удалось удалить изображение.');
      return;
    }

    setMessage('Дополнительное изображение удалено.');
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Изображения сайта</h2>
        <p className="mt-1 text-sm text-slate-600">
          Раздел для сотрудников: здесь можно безопасно заменить ключевые картинки сайта и сразу увидеть результат в предпросмотре.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Поддерживаются форматы JPG, PNG, WEBP, AVIF, SVG.</li>
          <li>Рекомендуемый размер файла: до 10 МБ.</li>
          <li>После загрузки не забудьте нажать «Сохранить изменения» в карточке.</li>
        </ul>

        {message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm sm:p-6">Загружаем изображения и статусы...</section>
      ) : null}

      {!loading && SITE_IMAGE_SLOTS.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm sm:p-6">
          Пока нет настроенных изображений для сайта.
        </section>
      ) : null}

      {!loading
        ? groupedSlots.map((group) => (
            <section key={group.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold text-slate-900">{group.label}</h3>
              <p className="mt-1 text-sm text-slate-600">Выберите карточку, чтобы заменить изображение и описание для конкретного блока сайта.</p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {group.slots.map((slot) => {
                  const draft = slotDrafts[slot.key] ?? { imageUrl: '', altText: slot.fallbackAlt, note: '' };
                  const existing = slotItemsMap.get(slot.key);
                  const previewUrl = draft.imageUrl || slot.fallbackUrl;
                  const isUploading = uploadingKey === slot.key;
                  const isSaving = savingKey === slot.key;

                  return (
                    <article key={slot.key} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{slot.pageTitle}</p>
                          <h4 className="mt-1 text-sm font-semibold text-slate-900">{slot.sectionLabel}</h4>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            existing ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {existing ? 'Установлено' : 'Стандартная картинка'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600">{slot.usageLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">Где отображается: {slot.route}</p>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt={draft.altText || slot.fallbackAlt} className="mt-3 h-40 w-full rounded-lg border border-slate-200 object-cover" />

                      <div className="mt-3 space-y-2">
                        <label className="text-xs font-medium text-slate-700">Alt текст (описание для SEO и доступности)</label>
                        <input
                          value={draft.altText}
                          onChange={(event) => setSlotDraftValue(slot.key, { altText: event.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Кратко опишите, что на картинке"
                        />
                      </div>

                      <div className="mt-3 space-y-2">
                        <label className="text-xs font-medium text-slate-700">Комментарий для команды (где используется)</label>
                        <textarea
                          rows={2}
                          value={draft.note}
                          onChange={(event) => setSlotDraftValue(slot.key, { note: event.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Например: Главная → первый экран"
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">
                          {isUploading ? 'Загрузка...' : existing ? 'Заменить изображение' : 'Загрузить изображение'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              void uploadImage(file, slot.key);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => void saveSlot(slot.key)}
                          disabled={isSaving || isUploading || !draft.imageUrl}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                        >
                          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>

                        {existing ? (
                          <button
                            type="button"
                            onClick={() => void deleteSlotImage(slot.key)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600"
                          >
                            Удалить и вернуть стандарт
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Дополнительные изображения</h3>
        <p className="mt-1 text-sm text-slate-600">Изображения для блоков, которые не привязаны к фиксированному месту. Можно хранить и переиспользовать.</p>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">{editingExtraId ? 'Редактирование карточки' : 'Добавить новую карточку'}</p>

            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Название</span>
              <input
                value={extraForm.title}
                onChange={(event) => setExtraForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Например: Иконка для блока контактов"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Alt текст</span>
              <input
                value={extraForm.altText}
                onChange={(event) => setExtraForm((prev) => ({ ...prev, altText: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Краткое описание изображения"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Где используется</span>
              <textarea
                rows={2}
                value={extraForm.note}
                onChange={(event) => setExtraForm((prev) => ({ ...prev, note: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Например: Страница услуг → карточка №2"
              />
            </label>

            {extraForm.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extraForm.imageUrl} alt={extraForm.altText || 'Предпросмотр'} className="h-36 w-full rounded-lg border border-slate-200 object-cover" />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">Изображение пока не выбрано.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                {uploadingKey === 'extra' ? 'Загрузка...' : extraForm.imageUrl ? 'Заменить изображение' : 'Загрузить изображение'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadImage(file, 'extra');
                    event.currentTarget.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => void saveExtraImage()}
                disabled={savingKey === 'extra' || uploadingKey === 'extra'}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {savingKey === 'extra' ? 'Сохранение...' : 'Сохранить'}
              </button>

              {editingExtraId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingExtraId(null);
                    setExtraForm(emptyExtraForm);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                >
                  Отменить
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            {extraItems.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Пока нет дополнительных изображений. Добавьте первую карточку слева.</p>
            ) : (
              extraItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.altText ?? item.title} className="h-28 w-full rounded-lg object-cover" />
                  <h4 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">Статус: сохранено в разделе «Дополнительные изображения»</p>
                  {item.description ? <p className="mt-1 text-xs text-slate-600">Где используется: {item.description}</p> : null}

                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => startEditExtra(item)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700">
                      Редактировать
                    </button>
                    <button type="button" onClick={() => void deleteExtra(item)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600">
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
