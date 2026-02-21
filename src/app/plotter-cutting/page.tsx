'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import Section from '@/components/Section';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

const heroBadges = ['Макс. ширина 600 мм', 'Резка по меткам', 'Срочные заказы'];

const pricingRows = [
  { label: 'Базовая резка', value: 'от 30 ₽ / м.п.' },
  { label: 'Выборка', value: '+15 ₽ / м.п.' },
  { label: 'Монтажная плёнка', value: '+100 ₽ / м²' },
  { label: 'Срочность', value: '+30%' },
  { label: 'Печать + резка по меткам', value: '+20% к стоимости печати' },
];

const priceFactors = [
  'длина реза',
  'количество мелких элементов',
  'плотность контура',
  'выборка',
  'срочность',
  'формат изделия',
];

const exampleCards = ['Брендированные наклейки', 'Контурные логотипы', 'Стикерпаки', 'Навигационные элементы'];

const allowedExtensions = ['cdr', 'ai', 'eps', 'pdf', 'svg', 'dxf', 'png', 'jpg', 'jpeg'];

type ServiceType = 'обычная' | 'по меткам';

export default function PlotterCuttingPage() {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('обычная');
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false });

  const acceptedAttr = useMemo(() => allowedExtensions.map((ext) => `.${ext}`).join(','), []);
  const phoneDigits = useMemo(() => getPhoneDigits(phone), [phone]);
  const phoneValid = phoneDigits.length === 11 && phoneDigits.startsWith('7');

  const nameError = touched.name && !name.trim() ? 'Введите имя.' : '';
  const phoneError = touched.phone && !phoneValid ? 'Введите телефон в формате +7 (999) 999-99-99.' : '';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({ name: true, phone: true });
    setSubmitError('');
    setSubmitSuccess('');

    if (!name.trim() || !phoneValid) {
      setSubmitError('Проверьте обязательные поля формы.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        source: 'plotter-cutting',
        name: name.trim(),
        phone,
        comment: comment.trim() || undefined,
        extras: {
          serviceType,
          files: files.map((file) => ({ name: file.name, size: file.size })),
        },
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      setSubmitSuccess('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
      setComment('');
      setFiles([]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-6 p-6 md:p-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold md:text-5xl">Плоттерная резка самоклеящейся пленки и оракала</h1>
            <p className="max-w-3xl text-neutral-700 dark:text-neutral-300">Точная контурная резка, выборка, монтаж.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {heroBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:border-red-300 hover:text-red-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:border-red-400/40 dark:hover:text-red-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Технические возможности</h2>
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/70">
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200 md:text-base">
              <li className="flex justify-between gap-6 border-b border-neutral-200 pb-3 dark:border-neutral-800">
                <span>Максимальная ширина резки</span>
                <span className="font-semibold text-right">600 мм</span>
              </li>
              <li className="space-y-2">
                <p className="font-medium">Резка по меткам:</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  <li>ширина макета до 570 мм</li>
                  <li>длина макета до 1500 мм</li>
                  <li>стоимость печати под резку +20%</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Стоимость услуг</h2>
          <div className="mt-5 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {pricingRows.map((item) => (
              <div key={item.label} className="grid items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/70 md:grid-cols-[1fr_auto] md:px-5 md:text-base">
                <span className="text-neutral-700 dark:text-neutral-200">{item.label}</span>
                <span className="text-left font-semibold text-neutral-900 dark:text-neutral-100 md:text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Что влияет на цену</h2>
            <ul className="mt-4 grid gap-2 text-sm text-neutral-700 dark:text-neutral-200 md:grid-cols-2 md:text-base">
              {priceFactors.map((factor) => (
                <li key={factor} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Требования к макету</h2>
            <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 md:text-base">Подготовьте файл заранее, чтобы быстро запустить резку в производство.</p>
            <button
              type="button"
              onClick={() => setIsRequirementsOpen(true)}
              className="mt-5 inline-flex rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold transition-colors hover:border-red-300 hover:text-red-700 dark:border-neutral-700 dark:hover:border-red-400/40 dark:hover:text-red-300"
            >
              Требования к макету
            </button>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Примеры работ</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exampleCards.map((title, index) => (
              <article
                key={title}
                className="group overflow-hidden rounded-2xl border border-neutral-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              >
                <div className="h-36 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800" />
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Пример {index + 1}: {title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Нужна печать перед резкой?</h2>
            <p className="text-neutral-700 dark:text-neutral-300">Сначала напечатаем макет, затем выполним контурную резку по меткам.</p>
          </div>
          <Link href="/wide-format-printing" className="btn-primary w-full text-center no-underline md:w-auto">Перейти к широкоформатной печати</Link>
        </div>
      </Section>

      <Section className="pt-0 pb-12">
        <form onSubmit={onSubmit} className="card space-y-5 p-6 md:p-8" id="plotter-request">
          <h2 className="text-2xl font-semibold">Заявка на плоттерную резку</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Имя *</label>
              <input
                id="name"
                value={name}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
              />
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium">Телефон *</label>
              <PhoneInput
                id="phone"
                value={phone}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                onChange={setPhone}
                placeholder="+7 (___) ___-__-__"
              />
              {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="serviceType" className="text-sm font-medium">Тип услуги</label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value as ServiceType)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="обычная">обычная</option>
              <option value="по меткам">по меткам</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="comment" className="text-sm font-medium">Комментарий</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="files" className="text-sm font-medium">Файл (опционально)</label>
            <input
              id="files"
              type="file"
              multiple
              accept={acceptedAttr}
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            {files.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center disabled:opacity-60 md:w-auto">
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </button>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-400">{submitSuccess}</p>}
          </div>
        </form>
      </Section>

      {isRequirementsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="plotter-requirements-title">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 id="plotter-requirements-title" className="text-xl font-semibold">Требования к макету</h3>
              <button
                type="button"
                onClick={() => setIsRequirementsOpen(false)}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-sm transition-colors hover:border-red-300 hover:text-red-700 dark:border-neutral-700 dark:hover:border-red-400/40 dark:hover:text-red-300"
              >
                Закрыть
              </button>
            </div>

            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200 md:text-base">
              <li><span className="font-semibold">Поддерживаемые форматы:</span> CDR, AI, EPS, PDF, SVG, DXF.</li>
              <li><span className="font-semibold">Максимальные размеры:</span> до 600 мм по ширине, для резки по меткам — до 570 × 1500 мм.</li>
              <li><span className="font-semibold">Минимальная толщина линии:</span> от 0.3 мм, без разрывов и наложений.</li>
              <li><span className="font-semibold">Метки позиционирования:</span> обязательны для печати + резки, расположение по углам макета.</li>
              <li><span className="font-semibold">Вылеты:</span> заложите вылеты 2–3 мм и безопасную зону от линии реза не менее 2 мм.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
