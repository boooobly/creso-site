'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get('ref') || '';
  const orderNumber = searchParams.get('order') || '';
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mark(status: 'paid' | 'failed') {
    if (!paymentRef || !orderNumber || !token) {
      setError('Недостаточно данных для mock-оплаты. Вернитесь на страницу заказа.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/api/payments/mock/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, paymentRef, status, token }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setError(result?.error || 'Не удалось обновить статус mock-оплаты.');
        return;
      }

      setMessage(status === 'paid' ? 'Тестовая оплата отмечена как успешная.' : 'Тестовая оплата отмечена как неуспешная.');
    } catch {
      setError('Не удалось обновить статус mock-оплаты.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Тестовая оплата (демо)</h1>
        <p className="text-sm text-neutral-600">Референс: {paymentRef || '—'}</p>
        <p className="text-xs text-neutral-500">Эта страница предназначена только для тестового/демо сценария оплаты.</p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => mark('paid')}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Отметить как «ОПЛАЧЕНО»
          </button>
          <button
            type="button"
            onClick={() => mark('failed')}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Отметить как «НЕУСПЕХ»
          </button>
        </div>

        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {orderNumber ? (
          <Link href={`/order/${encodeURIComponent(orderNumber)}${token ? `?token=${encodeURIComponent(token)}` : ''}`} className="text-sm text-red-600 underline underline-offset-2">
            Вернуться к заказу
          </Link>
        ) : (
          <p className="text-xs text-neutral-500">Откройте страницу заказа снова, чтобы увидеть обновлённый статус.</p>
        )}
      </div>
    </main>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<main className="container py-10 text-sm text-neutral-600">Загрузка страницы тестовой оплаты...</main>}>
      <MockPaymentContent />
    </Suspense>
  );
}
