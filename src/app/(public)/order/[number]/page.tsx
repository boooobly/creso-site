'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
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
  securePdfUrl?: string;
  accessToken?: string;
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
  const searchParams = useSearchParams();
  const orderNumber = String(params.number || '');
  const token = searchParams.get('token')?.trim() || '';

  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setOrder(null);
      setError('Ссылка на заказ недействительна или устарела. Обратитесь к менеджеру за новой ссылкой.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const json = await response.json().catch(() => null);

        if (!response.ok) {
          if (!cancelled) {
            setOrder(null);
            setError(response.status === 404 ? 'Заказ не найден.' : json?.error || 'Не удалось загрузить заказ.');
          }
          return;
        }

        if (!cancelled) {
          setOrder(json as OrderApiResponse);
        }
      } catch {
        if (!cancelled) setError('Не удалось загрузить заказ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

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
        body: JSON.stringify({ orderNumber: order.number, token: order.accessToken || token }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.redirectUrl) {
        setPayError(json?.error || 'Не удалось создать оплату.');
        return;
      }

      window.location.href = json.redirectUrl;
    } catch {
      setPayError('Не удалось создать оплату.');
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <main className="container py-12"><p className="text-sm text-neutral-600">Загрузка заказа...</p></main>;
  }

  if (error || !order) {
    return (
      <main className="container py-12">
        <h1 className="text-2xl font-semibold">Статус заказа</h1>
        <p className="mt-3 text-sm text-red-600">{error || 'Заказ не найден.'}</p>
      </main>
    );
  }

  const items = Array.isArray(order.quoteJson?.items) ? order.quoteJson?.items : [];

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Заказ #{order.number}</h1>
        <p className="text-sm text-neutral-600">Создан: {formatDate(order.createdAt)}</p>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-neutral-500">Клиент:</span> {order.customerName || '—'}</p>
          <p><span className="text-neutral-500">Телефон:</span> {order.phone || '—'}</p>
          <p><span className="text-neutral-500">Email:</span> {order.email || '—'}</p>
          <p><span className="text-neutral-500">Статус оплаты:</span> {order.paymentStatus || 'unpaid'}</p>
          <p className="sm:col-span-2"><span className="text-neutral-500">Итоговый размер:</span> {effectiveSizeText}</p>
          {order.comment ? <p className="sm:col-span-2"><span className="text-neutral-500">Комментарий:</span> {order.comment}</p> : null}
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-2 text-base font-semibold">Позиции</h2>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">Позиции отсутствуют.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {items.map((item, idx) => (
                <li key={`${item.title ?? 'item'}-${idx}`} className="flex items-center justify-between">
                  <span>{item.title || 'Позиция'}</span>
                  <span className="font-medium">{formatMoney(item.total)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-neutral-200 pt-3 text-sm">
            <p><span className="text-neutral-500">Итого:</span> <span className="font-semibold">{formatMoney(order.total)}</span></p>
            {order.prepayRequired ? (
              <p><span className="text-neutral-500">Предоплата (50%):</span> <span className="font-semibold">{formatMoney(order.prepayAmount)}</span></p>
            ) : null}
            {order.paidAt ? (
              <p><span className="text-neutral-500">Оплачено:</span> {formatDate(order.paidAt)}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={order.securePdfUrl || `/api/orders/${encodeURIComponent(order.number)}/pdf?token=${encodeURIComponent(order.accessToken || token)}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Скачать PDF
          </Link>

          {canPay ? (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {paying ? 'Создание оплаты...' : 'Оплатить'}
            </button>
          ) : (
            <span className="inline-flex items-center rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-800">Оплачено</span>
          )}
        </div>

        {payError ? <p className="text-sm text-red-600">{payError}</p> : null}
      </div>
    </main>
  );
}
