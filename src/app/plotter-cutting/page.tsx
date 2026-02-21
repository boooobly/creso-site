'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Section from '@/components/Section';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';

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

const exampleCards = [
  { title: 'Стикерпак для бренда', tag: 'наклейки', gradient: 'from-sky-500/25 via-cyan-400/10 to-transparent' },
  { title: 'Оформление витрины', tag: 'витрина', gradient: 'from-red-500/20 via-orange-500/10 to-transparent' },
  { title: 'Контурная серия с печатью', tag: 'по меткам', gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent' },
  { title: 'Маркировка оборудования', tag: 'оракал', gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent' },
];

const allowedExtensions = ['cdr', 'ai', 'eps', 'pdf', 'svg', 'dxf', 'png', 'jpg', 'jpeg'];

type ServiceType = 'обычная' | 'по меткам';

const revealBase =
  'data-[reveal=out]:translate-y-5 data-[reveal=out]:opacity-0 data-[reveal=in]:translate-y-0 data-[reveal=in]:opacity-100 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none';

export default function PlotterCuttingPage() {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const heroReveal = useRevealOnScroll<HTMLDivElement>({ threshold: 0.1 });
  const specsReveal = useRevealOnScroll<HTMLDivElement>();
  const pricingReveal = useRevealOnScroll<HTMLDivElement>();
  const factorsReveal = useRevealOnScroll<HTMLDivElement>();
  const examplesReveal = useRevealOnScroll<HTMLDivElement>();

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

  useEffect(() => {
    if (!isRequirementsOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRequirementsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isRequirementsOpen]);

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
    <div className="pb-16 md:pb-20">
      <Section className="pb-0 pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12">
          <div className="space-y-10 md:space-y-12">
            <div ref={heroReveal.ref} {...heroReveal.revealProps} className={`card overflow-hidden border border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50 to-red-50/40 p-7 shadow-sm shadow-neutral-200/60 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 dark:shadow-none md:p-11 ${revealBase}`}>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-[2.65rem] font-bold leading-tight md:text-[4.25rem] md:leading-[1.02]">Плоттерная резка самоклеящейся пленки и оракала</h1>
                <p className="max-w-2xl text-base text-neutral-700 dark:text-neutral-300 md:text-lg">Точная контурная резка, выборка, монтаж.</p>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Работаем с короткими и серийными тиражами. Точная геометрия линии реза.</p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {heroBadges.map((badge, index) => (
                  <span
                    key={badge}
                    style={heroReveal.getStaggerStyle(index * 90)}
                    className={`rounded-full border border-neutral-300 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 backdrop-blur-sm transition-colors hover:border-red-300 hover:text-red-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:border-red-400/40 dark:hover:text-red-300 ${revealBase}`}
                    data-reveal={heroReveal.isVisible || heroReveal.prefersReducedMotion ? 'in' : 'out'}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('plotter-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="btn-primary px-5 py-3"
                >
                  Оставить заявку
                </button>
                <button
                  type="button"
                  onClick={() => setIsRequirementsOpen(true)}
                  className="group relative text-sm font-medium text-neutral-700 transition-colors hover:text-red-700 dark:text-neutral-200 dark:hover:text-red-300"
                >
                  Требования к макету
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />
                </button>
              </div>
            </div>

            <div ref={specsReveal.ref} {...specsReveal.revealProps} className={`card border border-neutral-200 border-l-4 border-l-red-500 p-7 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:border-l-red-500 dark:shadow-none md:p-8 ${revealBase}`}>
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
                <div>
                  <h2 className="text-2xl font-semibold">Технические возможности</h2>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Производственный паспорт по ключевым параметрам резки и работе по меткам.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: '600', label: 'макс. ширина резки, мм' },
                    { key: '570', label: 'макс. ширина по меткам, мм' },
                    { key: '1500', label: 'макс. длина по меткам, мм' },
                    { key: '+20%', label: 'к печати под резку' },
                  ].map((item, index) => (
                    <article
                      key={item.label}
                      style={specsReveal.getStaggerStyle(index * 90)}
                      data-reveal={specsReveal.isVisible || specsReveal.prefersReducedMotion ? 'in' : 'out'}
                      className={`rounded-xl border border-neutral-200 bg-neutral-50/85 p-3.5 transition-colors duration-300 hover:border-red-200 hover:bg-red-50/40 dark:border-neutral-700 dark:bg-neutral-900/80 dark:hover:border-red-500/30 dark:hover:bg-red-500/5 ${revealBase}`}
                    >
                      <p className="text-[1.9rem] font-bold leading-none text-neutral-900 dark:text-neutral-100">{item.key}</p>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div ref={pricingReveal.ref} {...pricingReveal.revealProps} className={`card border border-neutral-200 p-7 dark:border-neutral-800 md:p-8 ${revealBase}`}>
              <h2 className="text-2xl font-semibold">Стоимость услуг</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Финальная сумма зависит от файла и сложности, но ориентиры по работам фиксированы.</p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                {pricingRows.map((item, index) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm transition-colors duration-300 odd:bg-white even:bg-neutral-100/80 hover:bg-red-50/80 dark:odd:bg-neutral-950 dark:even:bg-neutral-900 dark:hover:bg-red-500/10 md:px-5 md:py-3.5 md:text-base"
                  >
                    <span className="text-neutral-700 dark:text-neutral-200">{item.label}</span>
                    <span className="text-right font-semibold text-neutral-900 dark:text-neutral-100">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div ref={factorsReveal.ref} {...factorsReveal.revealProps} className={`card border border-neutral-200 p-7 dark:border-neutral-800 md:p-8 ${revealBase}`}>
              <h2 className="text-2xl font-semibold">Что влияет на цену</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Чем сложнее контур и постобработка, тем выше итоговая стоимость заказа.</p>
              <ul className="mt-5 grid gap-3.5 md:grid-cols-2">
                {priceFactors.map((factor, index) => (
                  <li key={factor} style={factorsReveal.getStaggerStyle(index * 80)} data-reveal={factorsReveal.isVisible || factorsReveal.prefersReducedMotion ? 'in' : 'out'} className={`flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-200 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:border-neutral-800 dark:hover:bg-neutral-900 ${revealBase}`}>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-[11px] font-bold text-red-700 dark:bg-red-500/25 dark:text-red-300">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div ref={examplesReveal.ref} {...examplesReveal.revealProps} className={revealBase}>
              <h2 className="text-2xl font-semibold">Примеры</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Типовые сценарии, в которых важны аккуратный контур и стабильная повторяемость.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {exampleCards.map((item, index) => (
                  <article
                    key={item.title}
                    style={examplesReveal.getStaggerStyle(index * 100)}
                    data-reveal={examplesReveal.isVisible || examplesReveal.prefersReducedMotion ? 'in' : 'out'}
                    className={`group overflow-hidden rounded-2xl border border-neutral-200 transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-[2px] hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 ${revealBase}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/15 via-transparent to-transparent" />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.title}</p>
                      <span className="rounded-full border border-neutral-300 bg-white/80 px-2 py-0.5 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300">{item.tag}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="card flex flex-col gap-4 border border-neutral-200 p-6 dark:border-neutral-800 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <h2 className="text-2xl font-semibold">Нужна печать перед резкой?</h2>
                <p className="text-neutral-700 dark:text-neutral-300">Сначала напечатаем макет, затем выполним контурную резку по меткам.</p>
              </div>
              <Link href="/wide-format-printing" className="btn-primary w-full text-center no-underline md:w-auto">Перейти к широкоформатной печати</Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <form onSubmit={onSubmit} className="card space-y-6 border border-neutral-200 p-6 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:shadow-none md:p-7" id="plotter-request">
              <div>
                <h2 className="text-2xl font-semibold">Заявка на плоттерную резку</h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Стоимость подтверждает менеджер после проверки макета. Без скрытых доплат.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Выберите тип резки, чтобы менеджер быстрее уточнил технологию.</p>
              </div>

              <div className="space-y-1.5">
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
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Можно приложить макет в векторном или растровом формате.</p>
                {files.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                    {files.map((file) => (
                      <li key={`${file.name}-${file.size}`}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 text-[15px] tracking-[0.01em] disabled:opacity-60">
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </button>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Менеджер уточнит длину реза и сложность бесплатно.</p>
                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                {submitSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-400">{submitSuccess}</p>}
              </div>
            </form>
          </aside>
        </div>
      </Section>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-200 motion-reduce:transition-none ${
          isRequirementsOpen ? 'pointer-events-auto bg-black/50 opacity-100' : 'pointer-events-none bg-black/0 opacity-0'
        }`}
        onClick={() => setIsRequirementsOpen(false)}
        aria-hidden={!isRequirementsOpen}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plotter-requirements-title"
          className={`w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900 motion-reduce:transition-none ${
            isRequirementsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 id="plotter-requirements-title" className="text-xl font-semibold">Требования к макету</h3>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsRequirementsOpen(false)}
              className="group relative rounded-md border border-neutral-300 px-2.5 py-1 text-sm transition-colors hover:border-red-300 hover:text-red-700 dark:border-neutral-700 dark:hover:border-red-400/40 dark:hover:text-red-300"
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
    </div>
  );
}
