'use client';

import { FormEvent, useState } from 'react';

type SubmitState = {
  type: 'idle' | 'success' | 'error';
  message?: string;
};

export default function ReviewSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ type: 'idle' });

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      isAnonymous: formData.get('isAnonymous') === 'on',
      rating: Number(formData.get('rating')),
      text: String(formData.get('text') || '').trim(),
      company: String(formData.get('company') || ''),
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
      setSubmitState({
        type: 'success',
        message: 'Спасибо! Отзыв отправлен на модерацию.',
      });
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
    <form onSubmit={onSubmit} className="card space-y-4 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-semibold md:text-2xl">Оставить отзыв</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Все новые отзывы проходят модерацию перед публикацией.
      </p>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Имя (необязательно)</span>
          <input name="name" maxLength={120} className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Оценка</span>
          <select name="rating" defaultValue="5" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" required>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
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
          minLength={10}
          maxLength={3000}
          rows={5}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
      </button>

      {submitState.type !== 'idle' ? (
        <p className={submitState.type === 'success' ? 'text-sm text-emerald-600' : 'text-sm text-red-600'}>
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}
