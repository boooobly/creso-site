'use client';

import { FormEvent, useMemo, useState } from 'react';

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:ru|com|net|org|io|dev|app|info|biz|me|co|su|рф)\b)/i;

type SubmitState = {
  type: 'idle' | 'success' | 'error';
  message?: string;
};

type ReviewSubmitFormProps = {
  onSubmitted?: () => void;
};

export default function ReviewSubmitForm({ onSubmitted }: ReviewSubmitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle' });
  const [rating, setRating] = useState(5);

  const starsPreview = useMemo(() => '★'.repeat(rating), [rating]);

  function closeModal() {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ type: 'idle' });

    const formData = new FormData(event.currentTarget);
    const text = String(formData.get('text') || '').trim();

    if (URL_PATTERN.test(text)) {
      setSubmitState({
        type: 'error',
        message: 'Ссылки в отзывах запрещены. Удалите URL и попробуйте снова.',
      });
      return;
    }

    const payload = {
      name: String(formData.get('name') || '').trim(),
      isAnonymous: formData.get('isAnonymous') === 'on',
      rating: Number(formData.get('rating')),
      text,
      website: String(formData.get('website') || ''),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setSubmitState({
          type: 'error',
          message: body?.error || 'Не удалось отправить отзыв. Попробуйте позже.',
        });
        return;
      }

      event.currentTarget.reset();
      setRating(5);
      setSubmitState({
        type: 'success',
        message: 'Спасибо! Ваш отзыв появится после модерации.',
      });
      onSubmitted?.();
    } catch {
      setSubmitState({
        type: 'error',
        message: 'Ошибка сети. Попробуйте позже.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setIsOpen(true)}>
        Оставить отзыв
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 md:p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold md:text-2xl">Оставить отзыв</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  Все новые отзывы проходят модерацию перед публикацией.
                </p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800" disabled={isSubmitting}>
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm">Имя (необязательно)</span>
                  <input
                    name="name"
                    maxLength={120}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Оценка</span>
                  <select
                    name="rating"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    required
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                  <p className="text-sm text-amber-500">{starsPreview}</p>
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isAnonymous" className="h-4 w-4" />
                Опубликовать анонимно
              </label>

              <label className="space-y-1">
                <span className="text-sm">Текст отзыва</span>
                <textarea
                  name="text"
                  required
                  minLength={20}
                  maxLength={3000}
                  rows={6}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                </button>
                <button type="button" className="rounded-xl border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700" onClick={closeModal} disabled={isSubmitting}>
                  Отмена
                </button>
              </div>

              {submitState.type !== 'idle' ? (
                <p className={submitState.type === 'success' ? 'text-sm text-emerald-600' : 'text-sm text-red-600'}>
                  {submitState.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
