'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type OrderItem = {
  title?: string;
  total?: number;
};

type OrderApiResponse = {
  number: string;
  createdAt: string;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  comment?: string | null;
  total: number;
  prepayRequired: boolean;
  prepayAmount?: number | null;
  paymentStatus?: string | null;
  paymentProvider?: string | null;
  paymentRef?: string | null;
  paidAmount?: number | null;
  paidAt?: string | null;
  quoteJson?: {
    effectiveSize?: {
      width?: number;
      height?: number;
    };
    items?: OrderItem[];
  };
};

function formatMoney(amount: number | null | undefined) {
  return `${Math.round(Number(amount ?? 0)).toLocaleString('ru-RU')} ₽`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU');
}

export default function OrderStatusPage() {
  const params = useParams<{ number: string }>();
  const orderNumber = String(params.number || '');
  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
          cache: 'no-store',
        });
        const json = await response.json().catch(() => null);

        if (!response.ok) {
          if (!cancelled) {
            setOrder(null);
            setError(response.status === 404 ? 'Order not found' : json?.error || 'Failed to load order');
          }
          return;
        }

        if (!cancelled) {
          setOrder(json as OrderApiResponse);
        }
      } catch {
        if (!cancelled) setError('Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const effectiveSizeText = useMemo(() => {
    const width = order?.quoteJson?.effectiveSize?.width;
    const height = order?.quoteJson?.effectiveSize?.height;

    if (!Number.isFinite(width) || !Number.isFinite(height)) return '—';
    return `${Math.round(Number(width))} × ${Math.round(Number(height))} мм`;
  }, [order]);

  const canPay = !!order && order.paymentStatus !== 'paid';

  async function handlePay() {
    if (!order) return;

    try {
      setPaying(true);
      setPayError(null);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: order.number }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.redirectUrl) {
        setPayError(json?.error || 'Payment session creation failed');
        return;
      }

      window.location.href = json.redirectUrl;
    } catch {
      setPayError('Payment session creation failed');
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <main className="container py-12"><p className="text-sm text-neutral-600">Loading order...</p></main>;
  }

  if (error || !order) {
    return (
      <main className="container py-12">
        <h1 className="text-2xl font-semibold">Order status</h1>
        <p className="mt-3 text-sm text-red-600">{error || 'Order not found'}</p>
      </main>
    );
  }

  const items = Array.isArray(order.quoteJson?.items) ? order.quoteJson?.items : [];

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Order #{order.number}</h1>
        <p className="text-sm text-neutral-600">Created: {formatDate(order.createdAt)}</p>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-neutral-500">Customer:</span> {order.customerName || '—'}</p>
          <p><span className="text-neutral-500">Phone:</span> {order.phone || '—'}</p>
          <p><span className="text-neutral-500">Email:</span> {order.email || '—'}</p>
          <p><span className="text-neutral-500">Payment status:</span> {order.paymentStatus || 'unpaid'}</p>
          <p className="sm:col-span-2"><span className="text-neutral-500">Effective size:</span> {effectiveSizeText}</p>
          {order.comment ? <p className="sm:col-span-2"><span className="text-neutral-500">Comment:</span> {order.comment}</p> : null}
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-2 text-base font-semibold">Items</h2>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">No items.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {items.map((item, idx) => (
                <li key={`${item.title ?? 'item'}-${idx}`} className="flex items-center justify-between">
                  <span>{item.title || 'Item'}</span>
                  <span className="font-medium">{formatMoney(item.total)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-neutral-200 pt-3 text-sm">
            <p><span className="text-neutral-500">Total:</span> <span className="font-semibold">{formatMoney(order.total)}</span></p>
            {order.prepayRequired ? (
              <p><span className="text-neutral-500">Prepayment (50%):</span> <span className="font-semibold">{formatMoney(order.prepayAmount)}</span></p>
            ) : null}
            {order.paidAt ? (
              <p><span className="text-neutral-500">Paid at:</span> {formatDate(order.paidAt)}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/api/orders/${encodeURIComponent(order.number)}/pdf`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Download PDF
          </Link>

          {canPay ? (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {paying ? 'Creating payment...' : 'Pay'}
            </button>
          ) : (
            <span className="inline-flex items-center rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-800">Paid</span>
          )}
        </div>

        {payError ? <p className="text-sm text-red-600">{payError}</p> : null}
      </div>
    </main>
  );
}
