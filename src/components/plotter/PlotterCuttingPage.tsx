'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlarmClock, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, FileCheck2, Ruler, Scissors, ScanSearch, Shapes, Spline, Sticker } from 'lucide-react';
import Section from '@/components/Section';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles } from '@/lib/public-form-styles';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';
import type { SiteImageRecord } from '@/lib/site-images';
import { reachGoal } from '@/lib/analytics/yandexMetrica';

const heroBadges = ['Ширина до 600 мм', 'Резка по меткам', 'Срочные заказы', 'Чистая выборка'];

const defaultPricingRows = [
  { label: 'Базовая резка', value: 'от 30 ₽ / м.п.' },
  { label: 'Выборка', value: '+15 ₽ / м.п.' },
  { label: 'Монтажная плёнка', value: '+100 ₽ / м²' },
  { label: 'Перенос на деталь', value: '+300 ₽' },
  { label: 'Срочность', value: '+30%' },
  { label: 'Минимальная стоимость заказа', value: 'от 400 ₽' },
];

const priceFactors = [
  { label: 'длина реза', icon: Ruler },
  { label: 'количество мелких элементов', icon: Shapes },
  { label: 'плотность контура', icon: Spline },
  { label: 'выборка', icon: Sticker },
  { label: 'срочность', icon: AlarmClock },
  { label: 'формат изделия', icon: ScanSearch },
];

const processSteps = [
  {
    title: 'Получаем макет и задачу',
    description: 'Принимаем файл, фиксируем задачу, материал, тираж и желаемый срок.',
    icon: FileCheck2,
  },
  {
    title: 'Проверяем и согласовываем',
    description: 'Проверяем контур и техпараметры, после чего подтверждаем стоимость и сроки.',
    icon: ClipboardCheck,
  },
  {
    title: 'Режем и подготавливаем к монтажу',
    description: 'Выполняем резку, выборку и передаём элементы в формате, удобном для монтажа.',
    icon: Scissors,
  },
];

const technicalStats = [
  { key: '600 мм', label: 'макс. ширина резки' },
  { key: '570 мм', label: 'ширина резки по меткам' },
  { key: '1500 мм', label: 'длина резки по меткам' },
  { key: '+20%', label: 'припуск к печати под резку' },
];

const trustPoints = [
  { text: 'Проверяем макет перед запуском и заранее отмечаем, что лучше поправить.', icon: FileCheck2 },
  { text: 'Объясняем, какой формат передачи выбрать: листами, с выборкой или с монтажной плёнкой.', icon: Scissors },
  { text: 'Подсказываем по материалу и техпараметрам, чтобы резка прошла без лишних рисков.', icon: CheckCircle2 },
  { text: 'Согласовываем срок и удобный способ передачи, чтобы вы спокойно приняли заказ.', icon: Clock3 },
];

const exampleCards = [
  { title: 'Стикерпак для бренда', tag: 'наклейки', image: '/images/plotter/plotter_labels.png', slotKey: 'plotter.examples.labels' },
  { title: 'Оформление витрины', tag: 'витрина', image: '/images/plotter/plotter_window.png', slotKey: 'plotter.examples.window' },
  { title: 'Резка по меткам', tag: 'по меткам', image: '/images/plotter/plotter_stickers.png', slotKey: 'plotter.examples.stickers' },
  { title: 'Оклейка машины', tag: 'оракал', image: '/images/plotter/plotter_car.png', slotKey: 'plotter.examples.car' },
] as const;

const allowedExtensions = ['cdr', 'ai', 'eps', 'pdf', 'svg', 'dxf', 'png', 'jpg', 'jpeg'];

type ServiceType = 'обычная' | 'по меткам';

const revealBase =
  'data-[reveal=out]:translate-y-5 data-[reveal=out]:opacity-0 data-[reveal=in]:translate-y-0 data-[reveal=in]:opacity-100 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none';

type PlotterCuttingPageProps = {
  siteImages: Record<string, SiteImageRecord | null>;
};

export default function PlotterCuttingPage({ siteImages }: PlotterCuttingPageProps) {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [pricingRows, setPricingRows] = useState(defaultPricingRows);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false, privacyConsent: false });
  const heroImage = siteImages['plotter.hero.main'];

  const acceptedAttr = useMemo(() => allowedExtensions.map((ext) => `.${ext}`).join(','), []);
  const phoneDigits = useMemo(() => getPhoneDigits(phone), [phone]);
  const phoneValid = phoneDigits.length === 11 && phoneDigits.startsWith('7');

  const nameError = touched.name && !name.trim() ? 'Введите имя.' : '';
  const phoneError = touched.phone && !phoneValid ? 'Введите телефон в формате +7 (999) 999-99-99.' : '';
  const privacyConsentError = touched.privacyConsent && !privacyConsent ? 'Необходимо согласие на обработку персональных данных.' : '';

  useEffect(() => {
    let ignore = false;

    fetch('/api/pricing/plotter-cutting')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || !data?.ok || !data?.config) return;
        const config = data.config as {
          baseCutPricePerMeter: number;
          weedingPricePerMeter: number;
          mountingFilmPricePerSquareMeter: number;
          transferPrice: number;
          urgentMultiplier: number;
          minimumOrderTotal: number;
        };

        setPricingRows([
          { label: 'Базовая резка', value: `от ${config.baseCutPricePerMeter} ₽ / м.п.` },
          { label: 'Выборка', value: `+${config.weedingPricePerMeter} ₽ / м.п.` },
          { label: 'Монтажная плёнка', value: `+${config.mountingFilmPricePerSquareMeter} ₽ / м²` },
          { label: 'Перенос на деталь', value: `+${config.transferPrice} ₽` },
          { label: 'Срочность', value: `+${Math.round((config.urgentMultiplier - 1) * 100)}%` },
          { label: 'Минимальная стоимость заказа', value: `от ${config.minimumOrderTotal} ₽` },
        ]);
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, []);
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

    setTouched({ name: true, phone: true, privacyConsent: true });
    setSubmitError('');
    setSubmitSuccess('');

    if (!name.trim() || !phoneValid || !privacyConsent) {
      setSubmitError('Проверьте обязательные поля формы.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.set('source', 'plotter-cutting');
      formData.set('name', name.trim());
      formData.set('phone', phoneDigits);
      if (comment.trim()) formData.set('comment', comment.trim());
      formData.set('pageUrl', typeof window !== 'undefined' ? window.location.href : '');
      formData.set('extras', JSON.stringify({
        service: 'Плоттерная резка',
        serviceType,
        privacyConsent,
      }));
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });

      const response = await fetch('/api/leads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      reachGoal('plotter_order_submit_success');
      setSubmitSuccess('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
      setComment('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 md:pb-24">
      <Section className="pb-0 pt-12 md:pt-16">
        <div ref={heroReveal.ref} {...heroReveal.revealProps} className={`card overflow-hidden border border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50 to-red-50/35 p-7 shadow-sm shadow-neutral-200/60 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 dark:shadow-none md:p-10 ${revealBase}`}>
          <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-red-200/90 bg-red-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">Фигурная резка плёнок</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.04]">Плоттерная резка самоклеящейся пленки и оракала</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-700 dark:text-neutral-300 md:text-[1.05rem] md:leading-7">Услуга плоттерной резки для самоклеящихся плёнок: от простых надписей до сложных контуров для наклеек, витрин и навигации.</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">Вы получаете комплект в нужном виде для монтажа: ровный рез, чистая выборка и удобная передача без лишней доработки.</p>

              <div className="mt-6 grid max-w-[30rem] grid-cols-2 gap-2">
                {heroBadges.map((badge, index) => (
                  <span
                    key={badge}
                    style={heroReveal.getStaggerStyle(index * 90)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-xs font-semibold leading-none text-neutral-700 backdrop-blur-sm shadow-none transition-colors hover:border-red-200 hover:text-red-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:border-red-400/40 dark:hover:text-red-300 ${revealBase}`}
                    data-reveal={heroReveal.isVisible || heroReveal.prefersReducedMotion ? 'in' : 'out'}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  data-floating-cta-hide
                  onClick={() => document.getElementById('plotter-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="btn-primary px-5 py-3"
                >
                  Рассчитать стоимость
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

            <div className={revealBase} data-reveal={heroReveal.isVisible || heroReveal.prefersReducedMotion ? 'in' : 'out'}>
              <div className="relative min-h-[260px] overflow-hidden rounded-2xl sm:min-h-[330px] lg:min-h-[420px]">
                <Image
                  src={heroImage?.url ?? '/images/plotter/plotter_hero.png'}
                  alt={heroImage?.altText || 'Плоттерная резка самоклеящейся пленки'}
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 py-4">
                  <p className="text-sm font-semibold text-white">Для наклеек, витрин, навигации и брендирования</p>
                  <p className="mt-1 text-xs text-white/85">Ровный контур, чистая выборка и предсказуемый результат на монтаже</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div id="plotter-examples" ref={examplesReveal.ref} {...examplesReveal.revealProps} className={revealBase}>
          <div className="section-header-tight mb-5">
            <p className="t-eyebrow">Применение</p>
            <h2 className="t-h3">Где чаще всего используют плоттерную резку</h2>
            <p className="t-body text-muted-foreground max-w-3xl">Типовые сценарии, в которых важны аккуратный контур, чистая выборка и стабильная повторяемость в тираже.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {exampleCards.map((item, index) => (
              <article
                key={item.title}
                style={examplesReveal.getStaggerStyle(index * 100)}
                data-reveal={examplesReveal.isVisible || examplesReveal.prefersReducedMotion ? 'in' : 'out'}
                className={`group overflow-hidden rounded-2xl border border-neutral-200 transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-[2px] hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 ${revealBase}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided URLs can be external and this fallback behavior relies on direct <img> error handling. */}
                  <img
                    src={siteImages[item.slotKey]?.url ?? item.image}
                    alt={siteImages[item.slotKey]?.altText || item.title}
                    loading="lazy"
                    className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex min-h-[62px] items-center justify-between gap-3 px-4 py-3">
                  <p className="text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">{item.title}</p>
                  <span className="rounded-full border border-neutral-300 bg-white/80 px-2 py-0.5 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300">{item.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-6">
          <div ref={specsReveal.ref} {...specsReveal.revealProps} className={`card border border-neutral-200/90 bg-white/95 p-7 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none md:p-8 ${revealBase}`}>
            <div className="section-header-tight mb-5">
              <p className="t-eyebrow">Процесс</p>
              <h2 className="t-h3">Как проходит работа</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {processSteps.map((step, index) => (
                <article
                  key={step.title}
                  style={specsReveal.getStaggerStyle(index * 100)}
                  data-reveal={specsReveal.isVisible || specsReveal.prefersReducedMotion ? 'in' : 'out'}
                  className={`card-info card-interactive h-full p-5 ${revealBase}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                      <step.icon size={17} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Шаг {index + 1}</p>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{step.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div ref={pricingReveal.ref} {...pricingReveal.revealProps} className={`card border border-neutral-200/90 bg-white/95 p-7 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none md:p-8 ${revealBase}`}>
              <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 dark:border-neutral-800/90 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">Ориентиры по стоимости</span>
                  <h2 className="mt-3 text-2xl font-semibold">Стоимость услуг</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-[15px]">Ниже — базовые цены на резку и допуслуги. Итог считаем по макету, тиражу и объёму ручной подготовки.</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.75rem] border border-neutral-200/90 bg-neutral-50/70 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400 md:px-4">
                  <span>Услуга</span>
                  <span>Стоимость</span>
                </div>
                <div className="space-y-2">
                  {pricingRows.map((item, index) => {
                    const isMinimum = index === pricingRows.length - 1;

                    return (
                      <div
                        key={item.label}
                        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-300 md:px-5 ${
                          isMinimum
                            ? 'border-red-200 bg-red-50/80 shadow-sm shadow-red-100/60 dark:border-red-500/20 dark:bg-red-500/10 dark:shadow-none'
                            : 'border-white bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:shadow-none'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 md:text-[15px]">{item.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{isMinimum ? 'Порог для небольших заказов и пробных запусков.' : 'Ориентир для типовых задач; точную сумму подтверждаем после просмотра макета.'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1.5 text-right text-sm font-semibold md:text-[15px] ${isMinimum ? 'bg-white text-red-700 dark:bg-neutral-950 dark:text-red-300' : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'}`}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div ref={factorsReveal.ref} {...factorsReveal.revealProps} className={`space-y-6 ${revealBase}`}>
              <div className="card border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-red-50/30 p-7 shadow-sm shadow-neutral-200/60 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 dark:shadow-none md:p-8">
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">Технические пределы</span>
                <h2 className="mt-3 text-2xl font-semibold">Технические возможности</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">Измеримые ограничения по ширине, длине и допускам для запуска в работу.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {technicalStats.map((item, index) => (
                    <article
                      key={item.label}
                      style={factorsReveal.getStaggerStyle(index * 80)}
                      data-reveal={factorsReveal.isVisible || factorsReveal.prefersReducedMotion ? 'in' : 'out'}
                      className={`rounded-xl border border-neutral-200 bg-neutral-50/85 p-3.5 transition-colors duration-300 hover:border-red-200 hover:bg-red-50/40 dark:border-neutral-700 dark:bg-neutral-900/80 dark:hover:border-red-500/30 dark:hover:bg-red-500/5 ${revealBase}`}
                    >
                      <p className="text-[1.4rem] font-bold leading-none text-neutral-900 dark:text-neutral-100">{item.key}</p>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="card border border-neutral-200/90 bg-white/95 p-7 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none md:p-8">
                <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 dark:border-neutral-800/90 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">Факторы расчёта</span>
                    <h2 className="mt-3 text-2xl font-semibold">Что влияет на цену</h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-[15px]">Цена меняется от сложности реза и объёма ручной доработки. Вот что влияет на смету в первую очередь.</p>
                  </div>
                  <p className="max-w-[220px] text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">По этим пунктам можно заранее понять, почему одинаковая площадь может стоить по-разному.</p>
                </div>

                <ul className="mt-5 grid gap-3 md:grid-cols-2">
                  {priceFactors.map((factor, index) => (
                    <li
                      key={factor.label}
                      style={factorsReveal.getStaggerStyle((index + 4) * 80)}
                      data-reveal={factorsReveal.isVisible || factorsReveal.prefersReducedMotion ? 'in' : 'out'}
                      className={`rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-700 dark:hover:bg-neutral-950 dark:hover:shadow-none ${revealBase}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                          <factor.icon size={16} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-medium capitalize text-neutral-900 dark:text-neutral-100 md:text-[15px]">{factor.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{index % 2 === 0 ? 'Чем сложнее этот параметр, тем больше времени уходит на резку и подготовку.' : 'Этот параметр добавляет ручные операции, поэтому итоговая стоимость выше.'}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card border border-neutral-200/90 bg-white/95 p-6 shadow-sm shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700 dark:text-red-300">Поддержка</p>
          <h2 className="mt-2 text-2xl font-semibold">Спокойно проведём через подготовку и передачу</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {trustPoints.map((item) => (
              <div key={item.text} className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 px-4 py-3 text-sm leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200">
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-red-50/25 p-6 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700 dark:text-red-300">Смежная услуга</p>
            <h2 className="mt-1 text-2xl font-semibold">Нужна печать перед резкой?</h2>
            <p className="text-neutral-700 dark:text-neutral-300">Если сначала нужна печать, выполним её и сразу передадим в контурную резку по меткам без лишних этапов.</p>
          </div>
          <Link href="/wide-format-printing" className="btn-primary inline-flex w-full items-center justify-center gap-2 text-center no-underline md:w-auto">
            Перейти к широкоформатной печати
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <div id="plotter-request" data-floating-cta-hide className={`${publicFormStyles.shell} border-neutral-200/90 dark:border-neutral-700/85`}>
          <div className="section-header-tight mb-6">
            <p className="t-eyebrow">Заявка</p>
            <h2 className="t-h3">Отправьте заявку на плоттерную резку</h2>
            <p className="t-body text-muted-foreground max-w-3xl">Оставьте параметры заказа — вернёмся с понятным расчётом и сроками.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium">Имя *</label>
                <input
                  id="name"
                  value={name}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  onChange={(event) => setName(event.target.value)}
                  className={`${publicFormStyles.inputBase} px-3.5`}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="serviceType" className="text-sm font-medium">Тип резки</label>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(event) => setServiceType(event.target.value as ServiceType)}
                  className={`${publicFormStyles.inputBase} px-3.5`}
                >
                  <option value="обычная">Обычная (резка по векторному контуру)</option>
                  <option value="по меткам">По меткам (печать + точная контурная резка)</option>
                </select>
                <p className={publicFormStyles.helper}>Обычная — когда есть контур для резки. По меткам — когда сначала печатаем, затем режем по позиционным меткам.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="files" className="text-sm font-medium">Файл (опционально)</label>
                <div className={publicFormStyles.uploadZone}>
                  <input
                    id="files"
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept={acceptedAttr}
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                    className={`${publicFormStyles.inputBase} h-auto rounded-lg p-2.5 text-sm`}
                  />
                  <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">Можно приложить макет в векторном или растровом формате.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="comment" className="text-sm font-medium">Комментарий</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className={`${publicFormStyles.inputBase} min-h-[120px] py-3`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={publicFormStyles.consent}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(event) => setPrivacyConsent(event.target.checked)}
                  onBlur={() => setTouched((prev) => ({ ...prev, privacyConsent: true }))}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500 dark:border-neutral-600 dark:bg-neutral-900"
                  required
                />
                <span>
                  Я согласен с обработкой персональных данных в соответствии с{' '}
                  <Link href="/privacy" className="underline hover:no-underline">
                    политикой конфиденциальности
                  </Link>
                  .
                </span>
              </label>
              {privacyConsentError && <p className="text-xs text-red-600">{privacyConsentError}</p>}
            </div>

            {files.length > 0 && (
              <ul className={`${publicFormStyles.summaryCard} list-disc space-y-1 pl-8`}>
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>{file.name}</li>
                ))}
              </ul>
            )}

            <div className={publicFormStyles.actionRow}>
              <p className={publicFormStyles.helper}>Уточним детали по макету и вернёмся с расчётом в рабочее время.</p>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 text-[15px] tracking-[0.01em] disabled:opacity-60 md:w-auto md:px-7">
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-400">{submitSuccess}</p>}
          </form>
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
