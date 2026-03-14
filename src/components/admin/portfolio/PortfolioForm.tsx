'use client';

import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

type PortfolioFormValues = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  coverImage: string;
  galleryImages: string;
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Сохраняем...' : label}
    </button>
  );
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

export default function PortfolioForm({
  heading,
  description,
  initialValues,
  submitLabel,
  action
}: PortfolioFormProps) {
  const [state, formAction] = useFormState(action, {});

  const galleryValue = useMemo(() => initialValues.galleryImages, [initialValues.galleryImages]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Название работы
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
              Короткое описание
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

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="coverImage" className="text-sm font-medium text-slate-700">
              Ссылка на обложку
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="url"
              defaultValue={initialValues.coverImage}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="https://..."
            />
          </div>

          {initialValues.coverImage ? (
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-slate-500">Текущая обложка</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initialValues.coverImage}
                alt="Обложка работы"
                className="h-40 w-full rounded-lg border border-slate-200 object-cover sm:w-80"
              />
            </div>
          ) : null}

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="galleryImages" className="text-sm font-medium text-slate-700">
              Изображения галереи
            </label>
            <textarea
              id="galleryImages"
              name="galleryImages"
              defaultValue={galleryValue}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder={'Вставьте ссылки через новую строку или запятую'}
            />
            <p className="text-xs text-slate-500">Можно добавить несколько ссылок. Позже подключим загрузку файлов прямо из панели.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="sortOrder" className="text-sm font-medium text-slate-700">
              Порядок показа
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
              Опубликовать на сайте
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="featured" defaultChecked={initialValues.featured} className="h-4 w-4" />
              Показать как избранную работу
            </label>
          </div>
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}

        <div className="flex items-center justify-end">
          <SubmitButton label={submitLabel} />
        </div>
      </form>
    </section>
  );
}
