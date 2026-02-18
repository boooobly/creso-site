'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

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
  hanging: HangingSelection;
  stand: boolean;
};

type BagetOrderModalProps = {
  open: boolean;
  onClose: () => void;
  orderSummary: BagetOrderSummary;
  previewImageUrl?: string;
  totalPriceRub: number;
  effectiveSize: SizeMm;
  outerSize?: SizeMm;
};

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
  comment?: string;
  consent?: string;
  submit?: string;
};

function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomPart = String(Math.floor(Math.random() * 10_000)).padStart(4, '0');
  return `CRD-${yyyy}${mm}${dd}-${randomPart}`;
}

export default function BagetOrderModal({
  open,
  onClose,
  orderSummary,
  previewImageUrl,
  totalPriceRub,
  effectiveSize,
  outerSize,
}: BagetOrderModalProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setOrderNumber('');
      setSubmitted(false);
      setSending(false);
      setErrors({});
      return;
    }

    setOrderNumber(generateOrderNumber());
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      modalRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
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

    try {
      setSending(true);
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'baget_order',
          name: name.trim(),
          phone,
          email: email.trim() || undefined,
          comment: comment.trim() || undefined,
          widthMm: orderSummary.workSizeMm.wMm,
          heightMm: orderSummary.workSizeMm.hMm,
          extras: {
            orderNumber,
            totalPriceRub,
            workSizeMm: orderSummary.workSizeMm,
            effectiveSizeMm: effectiveSize,
            outerSizeMm: outerSize ?? null,
            selectedBaget: orderSummary.selectedBaget,
            passepartout: orderSummary.passepartout,
            glazing: orderSummary.glazing,
            materials: orderSummary.materials,
            workType: orderSummary.workType,
            hanging: orderSummary.hanging,
            stand: orderSummary.stand,
          },
        }),
      });

      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !result?.ok) {
        setErrors((prev) => ({ ...prev, submit: result?.error || 'Не удалось отправить заявку. Попробуйте ещё раз.' }));
        return;
      }

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm"
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
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute right-4 top-4 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          ✕
        </button>

        <div className="mb-4 border-b border-neutral-200 pb-4 pr-10 dark:border-neutral-700">
          <h3 id="baget-order-title" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Оформление заказа
          </h3>
          <p className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-900/25 dark:text-red-300 dark:ring-red-700/60">
            Номер заказа: {orderNumber}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-200">
              Заявка отправлена. Мы свяжемся с вами в ближайшее время.
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">Номер заказа: {orderNumber}</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:bg-red-700"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
              <h4 className="text-base font-semibold">Состав заказа</h4>
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Предпросмотр работы"
                  className="h-36 w-full rounded-xl border border-neutral-200 object-cover dark:border-neutral-700"
                />
              ) : null}

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Размер работы</dt>
                  <dd className="text-right">{orderSummary.workSizeMm.wMm} × {orderSummary.workSizeMm.hMm} мм</dd>
                </div>
                {orderSummary.passepartout?.enabled ? (
                  <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                    <dt className="text-neutral-500">Размер с паспарту</dt>
                    <dd className="text-right">{effectiveSize.wMm} × {effectiveSize.hMm} мм</dd>
                  </div>
                ) : null}
                {outerSize ? (
                  <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                    <dt className="text-neutral-500">Габарит с рамкой</dt>
                    <dd className="text-right">{outerSize.wMm} × {outerSize.hMm} мм</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Багет</dt>
                  <dd className="text-right">
                    {orderSummary.selectedBaget
                      ? `${orderSummary.selectedBaget.title || 'Выбран'} (${orderSummary.selectedBaget.article || 'без артикула'})`
                      : 'Не выбран'}
                    {orderSummary.selectedBaget?.widthMm ? `, ${orderSummary.selectedBaget.widthMm} мм` : ''}
                    {orderSummary.selectedBaget?.pricePerM ? `, ${orderSummary.selectedBaget.pricePerM.toLocaleString('ru-RU')} ₽/м` : ''}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Паспарту</dt>
                  <dd className="text-right">
                    {orderSummary.passepartout?.enabled
                      ? `${orderSummary.passepartout.color}, верх/бок ${orderSummary.passepartout.topMm} мм, низ ${orderSummary.passepartout.bottomMm} мм`
                      : 'Без паспарту'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Остекление</dt>
                  <dd className="text-right">{orderSummary.glazing}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Материалы</dt>
                  <dd className="text-right">{orderSummary.materials.join(', ') || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Тип работы</dt>
                  <dd className="text-right">{orderSummary.workType}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Подвес</dt>
                  <dd className="text-right">{orderSummary.hanging.label} × {orderSummary.hanging.quantity}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-700">
                  <dt className="text-neutral-500">Ножка-подставка</dt>
                  <dd className="text-right">{orderSummary.stand ? 'Да' : 'Нет'}</dd>
                </div>
              </dl>

              <div className="rounded-xl border border-red-200 bg-white p-4 text-red-700 shadow-sm dark:border-red-800/60 dark:bg-neutral-900 dark:text-red-300">
                <p className="text-xs uppercase tracking-wide">Итоговая стоимость</p>
                <p className="mt-1 text-2xl font-bold">{totalPriceRub.toLocaleString('ru-RU')} ₽</p>
                <p className="mt-1 text-xs text-neutral-500">Самовывоз: предоплата 50%</p>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <h4 className="mb-4 text-base font-semibold">Контакты</h4>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="block space-y-1 text-sm">
                  <span>Имя *</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900"
                    placeholder="Введите имя"
                  />
                  {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
                </label>

                <label className="block space-y-1 text-sm">
                  <span>Телефон *</span>
                  <PhoneInput value={phone} onChange={setPhone} />
                  {errors.phone ? <p className="text-xs text-red-600">{errors.phone}</p> : null}
                </label>

                <label className="block space-y-1 text-sm">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900"
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
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900"
                    placeholder="Уточнения по заказу"
                  />
                  {errors.comment ? <p className="text-xs text-red-600">{errors.comment}</p> : null}
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1"
                  />
                  <span>Я согласен с обработкой персональных данных</span>
                </label>
                {errors.consent ? <p className="text-xs text-red-600">{errors.consent}</p> : null}

                {errors.submit ? <p className="text-sm text-red-600">{errors.submit}</p> : null}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? 'Отправка...' : 'Отправить заказ'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
  );
}
