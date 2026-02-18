'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get('ref') || '';
  const orderNumber = searchParams.get('order') || '';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mark(status: 'paid' | 'failed') {
    if (!paymentRef) {
      setError('Missing payment ref');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRef, status }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setError(result?.error || 'Failed to update payment status');
        return;
      }

      setMessage(`Payment marked as ${status.toUpperCase()}.`);
    } catch {
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Mock payment</h1>
        <p className="text-sm text-neutral-600">Ref: {paymentRef || '—'}</p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => mark('paid')}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Mark as PAID
          </button>
          <button
            type="button"
            onClick={() => mark('failed')}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Mark as FAILED
          </button>
        </div>

        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {orderNumber ? (
          <Link href={`/order/${encodeURIComponent(orderNumber)}`} className="text-sm text-red-600 underline underline-offset-2">
            Back to order
          </Link>
        ) : (
          <p className="text-xs text-neutral-500">Open your order page again to check updated status.</p>
        )}
      </div>
    </main>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<main className="container py-10 text-sm text-neutral-600">Loading payment...</main>}>
      <MockPaymentContent />
    </Suspense>
  );
}
