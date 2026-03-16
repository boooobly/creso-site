import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Building2, Clock3, FileCheck2, HardHat, ShieldCheck, Truck, Users } from 'lucide-react';
import Section from '@/components/Section';
import LeadForm from '@/components/LeadForm';
import RevealOnScroll from '@/components/RevealOnScroll';
import OutdoorFloatingCtas from '@/components/OutdoorFloatingCtas';
import ProductionTrustBlock from '@/components/ProductionTrustBlock';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import OutdoorPortfolioGallery from '@/components/OutdoorPortfolioGallery';
import { messages } from '@/lib/messages';

const services: Array<{ title: string; image: string; featured?: boolean }> = [
  { title: 'Световые короба', image: '/images/outdoor_examples/lightbox.png', featured: true },
  { title: 'Объемные буквы', image: '/images/outdoor_examples/dimensional_letters.png' },
  { title: 'Контражурные буквы', image: '/images/outdoor_examples/backlit_sign.png' },
  { title: 'Крышные установки', image: '/images/outdoor_examples/roof_sign.png' },
  { title: 'Баннеры', image: '/images/outdoor_examples/banner.png' },
  { title: 'Лайтбоксы', image: '/images/outdoor_examples/lightbox_cube.png' },
  { title: 'Гибкий неон', image: '/images/outdoor_examples/neon.png' },
  { title: 'Стелы', image: '/images/outdoor_examples/stela.png' },
  { title: 'Адресные таблички', image: '/images/outdoor_examples/adress_sign.png' },
  { title: 'Сложные конструкции любой сложности', image: '/images/outdoor_examples/custom.png' },
] as const;

const strengths: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Собственное производство',
    description: 'Контролируем качество и сроки без посредников.',
    icon: Building2,
  },
  {
    title: 'Монтажная бригада',
    description: 'Доставка и установка силами собственной команды.',
    icon: Users,
  },
  {
    title: 'Автовышка',
    description: 'Работаем с высотными объектами и сложным монтажом.',
    icon: HardHat,
  },
  {
    title: 'Работа на высоте',
    description: 'Выполняем монтажные работы на фасадах и крышах.',
    icon: ShieldCheck,
  },
  {
    title: 'Доставка по краю',
    description: 'Работаем по Ставропольскому краю и ближайшим городам.',
    icon: Truck,
  },
  {
    title: 'Заключаем договор',
    description: 'Фиксируем условия, этапы и стоимость работ.',
    icon: FileCheck2,
  },
  {
    title: 'Гарантия 5 лет',
    description: 'Сопровождаем проект и после установки.',
    icon: BadgeCheck,
  },
  {
    title: 'Более 15 лет на рынке',
    description: 'Опыт в изготовлении и монтаже рекламных конструкций.',
    icon: Clock3,
  },
];

const fullCycleItems = [
  'Дизайн и визуализация',
  'Технический расчет',
  'Проектирование',
  'Изготовление',
  'Монтаж',
] as const;

const heroTrustBadges = [
  'Работаем по ЮФО',
  'Гарантия до 5 лет',
  'Пожизненное сервисное обслуживание',
  'Собственное производство',
] as const;

const steps = ['Заявка', 'Замер (бесплатно по городу)', 'Производство', 'Монтаж'];

const cities = ['Невинномысске', 'Ставрополе', 'Пятигорске', 'Минеральных Водах', 'Кисловодске', 'Ессентуках'];

const portfolioProjects = [
  {
    id: 'baton',
    label: 'Baton',
    images: [
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton.png',
        alt: 'Проект Baton: общий вид рекламной конструкции',
        title: 'Общий вид',
        category: 'Фасадная вывеска',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-1.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton_zoom.png',
        alt: 'Проект Baton: крупный план деталей вывески',
        title: 'Детали',
        category: 'Крупный план',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-2.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/baton_night.png',
        alt: 'Проект Baton: ночной вид с подсветкой',
        title: 'Ночной вид',
        category: 'Подсветка',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-3.svg',
      },
    ],
  },
  {
    id: 'cheese',
    label: 'Cheese',
    images: [
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese.png',
        alt: 'Проект Cheese: общий вид рекламной конструкции',
        title: 'Общий вид',
        category: 'Фасадная вывеска',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-4.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese_zoom.png',
        alt: 'Проект Cheese: крупный план деталей вывески',
        title: 'Детали',
        category: 'Крупный план',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-5.svg',
      },
      {
        src: '/images/outdoor_advertising/outdoor_portfolio/cheese_night.png',
        alt: 'Проект Cheese: ночной вид с подсветкой',
        title: 'Ночной вид',
        category: 'Подсветка',
        fallbackSrc: '/images/outdoor-portfolio/placeholder-6.svg',
      },
    ],
  },
] as const;

export default async function OutdoorAdvertisingPage() {
  const contentMap = await getPageContentMap('outdoor');
  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Наружная реклама под ключ в Ставропольском крае');
  const heroDescription = getPageContentValue(contentMap, 'hero', 'description', 'Проектирование, производство и монтаж рекламных конструкций любой сложности по ЮФО.');
  const heroPrimaryButtonText = getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Получить бесплатный расчет');
  const heroSecondaryButtonText = getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть примеры работ');
  const ctaTitle = getPageContentValue(contentMap, 'cta', 'title', 'Нужна срочная установка?');
  const ctaDescription = getPageContentValue(contentMap, 'cta', 'description', 'Изготавливаем и монтируем конструкции в сжатые сроки.');
  const ctaButtonText = getPageContentValue(contentMap, 'cta', 'buttonText', 'Получить расчет');
  return (
    <div className="pb-24 md:pb-0">
      <OutdoorFloatingCtas />

      <Section className="pb-6 md:pb-10" id="outdoor-hero" background="default">
        <div className="card grid gap-8 bg-gradient-to-b from-neutral-100 to-white p-6 dark:from-neutral-950 dark:to-neutral-900 md:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex h-full flex-col gap-6 md:gap-7">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">{heroTitle}</h1>
              <p className="max-w-3xl text-lg text-neutral-700 dark:text-neutral-300">{heroDescription}</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {heroTrustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#outdoor-form-section"
                className="btn-primary no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >{heroPrimaryButtonText}</Link>
              <Link
                href="#outdoor-portfolio"
                className="btn-secondary no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >{heroSecondaryButtonText}</Link>
            </div>
          </div>

          <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-md dark:border-neutral-700 dark:bg-neutral-900 md:min-h-[440px]">
            <Image
              src="/images/outdoor_advertising/manufacturing.png"
              alt="Производство наружной рекламы"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
          </div>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-portfolio" background="muted">
        <RevealOnScroll>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Портфолио</h2>
            <p className="hidden text-sm text-neutral-600 md:block dark:text-neutral-300">Реализованные проекты по региону</p>
          </div>
          <OutdoorPortfolioGallery projects={[...portfolioProjects]} />
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <h2 className="mb-6 text-2xl font-bold">Что изготавливаем</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className={`card group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-[2px] hover:shadow-xl hover:shadow-black/15 ${service.featured ? 'min-h-[240px] md:col-span-2 lg:col-span-3 lg:min-h-[300px]' : 'min-h-[180px]'}`}
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes={service.featured ? '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 95vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-base font-semibold leading-snug text-white md:text-lg">{service.title}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted">
        <RevealOnScroll>
          <h2 className="mb-6 text-2xl font-bold">Почему выбирают нас</h2>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {strengths.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="h-full rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="default">
        <RevealOnScroll>
          <h2 className="mb-6 text-2xl font-bold">Полный цикл работ</h2>

          <ol className="grid gap-3 md:grid-cols-5">
            {fullCycleItems.map((item, index) => (
              <li
                key={item}
                className="card list-none rounded-xl border border-neutral-200/90 p-4 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/10"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Этап {index + 1}</p>
                <p className="text-sm font-semibold leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>

          <article className="card mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 md:p-6 dark:border-neutral-700 dark:bg-neutral-900/60">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-base font-semibold">Сервис и сопровождение</h3>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">
                  Диагностика и обслуживание, реставрация и обновление, постгарантийная поддержка.
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Сопровождаем вывески на всем сроке эксплуатации.</p>
            </div>
          </article>
        </RevealOnScroll>
      </Section>

      <Section className="pt-0" background="muted">
        <RevealOnScroll>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 md:p-7">
            <h2 className="mb-5 text-2xl font-bold">Как мы работаем</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step} className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/70">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">Шаг {index + 1}</p>
                  <p className="text-sm font-semibold">{step}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
              Выезд в другие города — платный. <br />Возможен заказ по размерам клиента.
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      <ProductionTrustBlock />

      <Section className="pt-0" background="default">
        <div className="grid items-center gap-5 rounded-2xl bg-neutral-900 px-6 py-7 text-white dark:bg-neutral-800 md:grid-cols-[1fr_auto] md:gap-6 md:px-8">
          <div>
            <h2 className="text-3xl font-bold">{ctaTitle}</h2>
            <p className="mt-2.5 max-w-2xl text-neutral-200">{ctaDescription}</p>
          </div>
          <Link
            href="#outdoor-form-section"
            className="btn-primary w-full no-underline ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:w-auto"
          >{ctaButtonText}</Link>
        </div>
      </Section>

      <Section className="pt-0" background="muted">
        <div className="card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold">Работаем по всему Ставропольскому краю</h2>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">Изготавливаем и монтируем наружную рекламу в:</p>
          <div className="mt-5 grid gap-6 md:grid-cols-[1.15fr_1fr]">
            <ul className="grid gap-x-4 gap-y-2 text-sm md:grid-cols-2">
              {cities.map((city) => (
                <li key={city} className="text-neutral-700 dark:text-neutral-300">
                  • {city}
                </li>
              ))}
              <li className="text-neutral-700 dark:text-neutral-300">• и других городах региона</li>
            </ul>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Собственная бригада, выезд на замер и доставка конструкций позволяют запускать проекты быстро и в удобные сроки.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0" id="outdoor-form-section" background="default">
        <RevealOnScroll>
          <div className="card rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-6 md:p-8 dark:border-neutral-700 dark:bg-neutral-900/50">
            <h2 className="text-2xl font-bold">Получить бесплатный расчет наружной рекламы</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Ответим по стоимости, срокам и предложим оптимальный формат изготовления.</p>
            <div className="mt-5 [&_label]:text-neutral-700 [&_label]:dark:text-neutral-300 [&_label>span]:leading-relaxed [&_p]:text-neutral-600 [&_p]:dark:text-neutral-300">
              <LeadForm
                t={messages}
                source="outdoor"
                initialService="Наружная реклама"
                showMessageField
                phoneRequired
                submitMessagePrefix="Запрос: Наружная реклама (Ставропольский край)."
                includePageUrl
              />
            </div>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}
