'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { BagetQuoteResult } from '@/lib/calculations/bagetQuote';
import type { FrameMode } from './BagetFilters';
import type { BagetPrintMaterial, BagetTransferSource } from '@/lib/baget/printRequirement';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import BagetPreview, { type BagetPreviewProps } from './BagetPreview';
import { reachGoal, YANDEX_GOALS } from '@/lib/analytics/yandexMetrica';

type SizeMm = {
  wMm: number;
  hMm: number;
};

type BagetSelection = {
  id?: string | number;
  article?: string;
  title?: string;
  widthMm?: number;
  pricePerM?: number;
} | null;

type PassepartoutSelection = {
  enabled: boolean;
  color: string;
  topMm: number;
  bottomMm: number;
} | null;

type HangingSelection = {
  type: string;
  label: string;
  quantity: number;
};

export type BagetOrderSummary = {
  workSizeMm: SizeMm;
  selectedBaget: BagetSelection;
  passepartout: PassepartoutSelection;
  glazing: string;
  materials: string[];
  workType: string;
  frameMode: FrameMode;
  hanging: HangingSelection;
  stand: boolean;
  printRequirement: {
    requiresPrint: boolean;
    printMaterial: BagetPrintMaterial | null;
    transferSource: BagetTransferSource | null;
    printCost: number;
  };
  priceItems?: Array<{
    key: string;
    title: string;
    total: number;
  }>;
};

export type BagetOrderRequestBagetInput = {
  width: number;
  height: number;
  quantity: number;
  selectedBagetId?: string | null;
  workType: 'canvas' | 'stretchedCanvas' | 'canvasOnStretcher' | 'rhinestone' | 'embroidery' | 'beads' | 'photo' | 'other';
  glazing: 'none' | 'glass' | 'antiReflectiveGlass' | 'plexiglass' | 'pet1mm';
  hasPassepartout: boolean;
  passepartoutSize?: number;
  passepartoutBottomSize?: number;
  backPanel: boolean;
  hangerType?: 'crocodile' | 'wire' | null;
  stand: boolean;
  stretcherType?: 'narrow' | 'wide' | null;
  frameMode?: 'framed' | 'noFrame' | null;
  requiresPrint: boolean;
  printMaterial: BagetPrintMaterial | null;
  transferSource: BagetTransferSource | null;
  printCost?: number;
};

type BagetOrderModalProps = {
  open: boolean;
  onClose: () => void;
  orderSummary: BagetOrderSummary;
  orderInput: {
    baget: BagetOrderRequestBagetInput;
    fulfillmentType?: 'pickup' | 'selfPickup' | 'delivery';
  } | null;
  uploadedImageFile?: File | null;
  totalPriceRub: number;
  effectiveSize: SizeMm;
  outerSize?: SizeMm;
  previewProps: BagetPreviewProps;
};

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
  comment?: string;
  consent?: string;
  submit?: string;
};


type OrderResponse = {
  orderNumber: string;
  quote: BagetQuoteResult;
  secureOrderUrl?: string;
};

export default function BagetOrderModal({
  open,
  onClose,
  orderSummary,
  orderInput,
  uploadedImageFile,
  totalPriceRub,
  effectiveSize,
  outerSize,
  previewProps,
}: BagetOrderModalProps) {
  const [serverResult, setServerResult] = useState<OrderResponse | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [animateIn, setAnimateIn] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setServerResult(null);
      setSubmitted(false);
      setSending(false);
      setErrors({});
      setAnimateIn(false);
      return;
    }

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalLeft = document.body.style.left;
    const originalRight = document.body.style.right;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    const timer = window.setTimeout(() => {
      modalRef.current?.focus();
      setAnimateIn(true);
    }, 16);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.right = originalRight;
      document.body.style.width = originalWidth;
      window.scrollTo({ top: scrollY });
      setAnimateIn(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onEsc as EventListener);
    return () => window.removeEventListener('keydown', onEsc as EventListener);
  }, [onClose, open]);

  const canSubmit = useMemo(() => {
    return !sending && !!consent;
  }, [consent, sending]);

  const finalTotalRub = serverResult?.quote.total ?? totalPriceRub;

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Введите имя не короче 2 символов.';
    }

    const digits = getPhoneDigits(phone);
    if (digits.length !== 11 || !digits.startsWith('7')) {
      nextErrors.phone = 'Укажите телефон в формате +7 (XXX) XXX-XX-XX.';
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Введите корректный email.';
    }

    if (!consent) {
      nextErrors.consent = 'Необходимо согласие на обработку данных.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!orderInput) {
      setErrors((prev) => ({ ...prev, submit: 'Не выбран багет для оформления заказа.' }));
      return;
    }

    try {
      setSending(true);
      const requestPayload = {
        customer: {
          name: name.trim(),
          phone,
          email: email.trim() || undefined,
          comment: comment.trim() || undefined,
        },
        baget: orderInput.baget,
        fulfillmentType: orderInput.fulfillmentType ?? 'pickup',
      };

      const requestInit: RequestInit = uploadedImageFile
        ? (() => {
            const formData = new FormData();
            formData.set('payload', JSON.stringify(requestPayload));
            formData.set('customerImage', uploadedImageFile, uploadedImageFile.name);
            return { method: 'POST', body: formData };
          })()
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload),
          };

      const response = await fetch('/api/orders', requestInit);

      const result = (await response.json().catch(() => null)) as (OrderResponse & { error?: string }) | null;

      if (!response.ok || !result?.orderNumber || !result.quote) {
        setErrors((prev) => ({ ...prev, submit: result?.error || 'Не удалось отправить заказ. Попробуйте ещё раз.' }));
        return;
      }

      reachGoal(YANDEX_GOALS.bagetOrderSubmitSuccess);
      setServerResult(result);
      setSubmitted(true);
      setErrors({});
    } catch {
      setErrors((prev) => ({ ...prev, submit: 'Ошибка сети. Проверьте соединение и попробуйте снова.' }));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ease-out ${
        animateIn ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-black/0 backdrop-blur-0'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="baget-order-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none transition-all duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-900 ${
          animateIn ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          ✕
        </button>

        <div className="sticky top-0 z-[1] rounded-t-2xl border-b border-neutral-200 bg-white/95 px-5 py-4 pr-20 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 sm:px-6 sm:pr-24">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 id="baget-order-title" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Оформление заказа
            </h3>
            <p className="mr-2 inline-flex self-start rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 sm:mr-0">
              Заказ: {serverResult?.orderNumber ?? 'будет присвоен после отправки'}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-200">
                <p className="font-medium">Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
                <p className="mt-2 text-xs sm:text-sm">Номер заказа: {serverResult?.orderNumber}</p>
                {serverResult?.secureOrderUrl ? (
                  <p className="mt-2 text-xs sm:text-sm">
                    <Link href={serverResult.secureOrderUrl} className="text-red-700 underline underline-offset-2 hover:text-red-800">
                      Открыть страницу заказа
                    </Link>
                  </p>
                ) : null}
                <p className="mt-1 text-xs sm:text-sm">Итог по расчёту сервера: {serverResult?.quote.total.toLocaleString('ru-RU')} ₽</p>
                <p className="mt-1 text-xs sm:text-sm">Оплата и предоплата согласуются с менеджером после проверки заказа.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-xl active:scale-[0.98]"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
                <div className="overflow-hidden rounded-xl">
                  <BagetPreview
                    {...previewProps}
                    className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>

                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Состав заказа</h4>

                <dl className="grid grid-cols-1 gap-1">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Размер работы</dt>
                    <dd className="rounded-lg bg-neutral-100 px-2 py-1 text-right text-sm font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                      {orderSummary.workSizeMm.wMm} × {orderSummary.workSizeMm.hMm} мм
                    </dd>
                  </div>

                  {orderSummary.passepartout?.enabled ? (
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                      <dt className="text-sm text-neutral-500 dark:text-neutral-400">Размер с паспарту</dt>
                      <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {effectiveSize.wMm} × {effectiveSize.hMm} мм
                      </dd>
                    </div>
                  ) : null}

                  {outerSize ? (
                    <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                      <dt className="text-sm text-neutral-500 dark:text-neutral-400">Габарит с рамкой</dt>
                      <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {outerSize.wMm} × {outerSize.hMm} мм
                      </dd>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Багет</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {orderSummary.selectedBaget
                        ? `${orderSummary.selectedBaget.title || 'Выбран'} (${orderSummary.selectedBaget.article || 'без артикула'})`
                        : orderSummary.frameMode === 'noFrame'
                          ? 'Без рамки'
                          : 'Не выбран'}
                      {orderSummary.selectedBaget?.widthMm ? `, ${orderSummary.selectedBaget.widthMm} мм` : ''}
                      {orderSummary.selectedBaget?.pricePerM ? `, ${orderSummary.selectedBaget.pricePerM.toLocaleString('ru-RU')} ₽/м` : ''}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Паспарту</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {orderSummary.passepartout?.enabled
                        ? `${orderSummary.passepartout.color}, верх/бок ${orderSummary.passepartout.topMm} мм, низ ${orderSummary.passepartout.bottomMm} мм`
                        : 'Без паспарту'}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Остекление</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.glazing}</dd>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Материалы</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {orderSummary.materials.join(', ') || '—'}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Тип работы</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.workType}</dd>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Подвес</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {orderSummary.hanging.label} × {orderSummary.hanging.quantity}
                    </dd>
                  </div>

                  {orderSummary.printRequirement.requiresPrint ? (
                    <>
                      <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Требуется печать</dt>
                        <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">Да</dd>
                      </div>

                      <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Материал печати</dt>
                        <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {orderSummary.printRequirement.printMaterial === 'paper' ? 'Бумага' : 'Холст'}
                        </dd>
                      </div>
                    </>
                  ) : null}

                  <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg px-2 py-1 odd:bg-neutral-100/60 dark:odd:bg-neutral-700/20">
                    <dt className="text-sm text-neutral-500 dark:text-neutral-400">Ножка-подставка</dt>
                    <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">{orderSummary.stand ? 'Да' : 'Нет'}</dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-[0_10px_30px_rgba(220,38,38,0.12)] dark:border-red-800 dark:bg-red-950/30 dark:shadow-[0_10px_30px_rgba(220,38,38,0.18)]">
                  <p className="text-xs uppercase tracking-wide text-red-700/80 dark:text-red-200/80">Итоговая стоимость</p>
                  <p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-200">{finalTotalRub.toLocaleString('ru-RU')} ₽</p>
                  {orderSummary.priceItems?.length ? (
                    <dl className="mt-4 space-y-2 border-t border-red-200/70 pt-3 text-sm text-neutral-700 dark:border-red-800/60 dark:text-neutral-200">
                      {orderSummary.priceItems.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-3">
                          <dt>{item.title}</dt>
                          <dd className="font-medium">{Math.round(item.total).toLocaleString('ru-RU')} ₽</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">Контакты</h4>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <label className="block space-y-1 text-sm">
                    <span>Имя *</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      placeholder="Введите имя"
                    />
                    {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span>Телефон *</span>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      className="bg-neutral-50 dark:bg-neutral-800"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Мы свяжемся для уточнения деталей</p>
                    {errors.phone ? <p className="text-xs text-red-600">{errors.phone}</p> : null}
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      placeholder="name@example.com"
                    />
                    {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span>Комментарий</span>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 shadow-sm transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      placeholder="Уточнения по заказу"
                    />
                    {errors.comment ? <p className="text-xs text-red-600">{errors.comment}</p> : null}
                  </label>

                  <div className={`rounded-xl border p-3 transition-colors ${errors.consent ? 'border-red-300 bg-red-50/60 dark:border-red-700/70 dark:bg-red-900/15' : 'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/60'}`}>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        Я согласен с обработкой персональных данных и ознакомлен с{' '}
                        <Link href="/privacy" className="text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                          политикой конфиденциальности
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.consent ? <p className="mt-2 text-xs text-red-600">{errors.consent}</p> : null}
                  </div>

                  {errors.submit ? <p className="text-sm text-red-600">{errors.submit}</p> : null}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
                    >
                      {sending ? 'Отправка...' : 'Отправить заказ'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Вернуться к настройкам
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
